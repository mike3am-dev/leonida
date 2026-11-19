-- Leonida · Scatti: cancellare davvero una foto (l'autore la sua, l'admin tutte), modificarla, admin sui commenti.
-- Si incolla tutto nel SQL Editor di Supabase e si preme Run. Si può rilanciare: non rompe niente.
-- Prima di questo va lanciato una volta admin-codice.sql (crea la tabella con l'impronta del codice di Mike).
-- Le funzioni vecchie (scatto_togli, commento_togli) restano: le usa chi ha ancora l'app non aggiornata.

create table if not exists public.leonida_admin (impronta text primary key);
alter table public.leonida_admin enable row level security;

-- vero se il codice è quello dell'admin; se è sbagliato aspetta mezzo secondo (contro chi prova a indovinarlo)
create or replace function public.leonida_admin_ok(p_codice text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_codice is null or length(p_codice) < 8 then return false; end if;
  if exists (select 1 from leonida_admin where impronta = encode(sha256(convert_to(p_codice, 'UTF8')), 'hex')) then return true; end if;
  perform pg_sleep(0.5); return false;
end $$;

-- i file da cancellare dal bucket: la funzione li segna qui, poi l'app li cancella (la regola sotto lo permette solo per questi)
create table if not exists public.scatti_cestino (percorso text primary key, quando timestamptz not null default now());
alter table public.scatti_cestino enable row level security;

-- cancella la foto (con i suoi mi piace e commenti) e restituisce il file da togliere dal bucket
create or replace function public.scatto_cancella(p_email text, p_id uuid, p_codice text default null)
returns text language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email)); r scatti%rowtype;
begin
  select * into r from scatti where id = p_id;
  if not found then return null; end if;
  if r.autore <> e and not leonida_admin_ok(p_codice) then raise exception 'non puoi cancellare questa foto'; end if;
  insert into scatti_cestino(percorso) values (r.percorso) on conflict (percorso) do update set quando = now();
  delete from scatti where id = p_id;
  return r.percorso;
end $$;

create or replace function public.scatto_nel_cestino(p_percorso text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from scatti_cestino where percorso = p_percorso and quando > now() - interval '1 day');
$$;

-- l'autore corregge didascalia, zona e spoiler della sua foto
create or replace function public.scatto_modifica(p_email text, p_id uuid, p_didascalia text, p_zona text, p_spoiler int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update scatti set didascalia = left(coalesce(p_didascalia, ''), 280), zona = left(coalesce(p_zona, ''), 60), spoiler = greatest(0, least(coalesce(p_spoiler, 0), 9))
  where id = p_id and autore = lower(trim(p_email));
  if not found then raise exception 'puoi modificare solo le tue foto'; end if;
end $$;

-- cancella un commento: chi l'ha scritto, oppure l'admin
create or replace function public.commento_cancella(p_email text, p_id uuid, p_codice text default null)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email)); chi_e text;
begin
  select chi into chi_e from scatti_commenti where id = p_id;
  if not found then return; end if;
  if chi_e <> e and not leonida_admin_ok(p_codice) then raise exception 'non puoi cancellare questo commento'; end if;
  delete from scatti_commenti where id = p_id;
end $$;

do $$ declare f text; begin
  foreach f in array array['leonida_admin_ok(text)', 'scatto_cancella(text,uuid,text)', 'scatto_nel_cestino(text)', 'scatto_modifica(text,uuid,text,text,int)', 'commento_cancella(text,uuid,text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon', f);
  end loop;
end $$;

-- dal bucket si può cancellare (e, per cancellare, vedere) solo un file che una funzione ha appena messo nel cestino
drop policy if exists "leonida scatti cancellano" on storage.objects;
create policy "leonida scatti cancellano" on storage.objects for delete to anon using (bucket_id = 'scatti' and public.scatto_nel_cestino(name));
drop policy if exists "leonida scatti cestino visibile" on storage.objects;
create policy "leonida scatti cestino visibile" on storage.objects for select to anon using (bucket_id = 'scatti' and public.scatto_nel_cestino(name));
