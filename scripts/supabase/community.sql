-- Leonida · community: «La banda» (classifica tra amici) e «Scatti» (galleria di foto con mi piace e commenti).
-- Si incolla tutto nel SQL Editor di Supabase e si preme Run. Si può rilanciare: non rompe niente.
-- Le tabelle restano chiuse (RLS senza policy): dall'app si passa solo dalle funzioni qui sotto.

-- ---------- La banda ----------
-- Restituisce nick e progressi (solo missioni, collezionabili, trofei, attività: niente appunti, niente email)
-- di chi non ha spento «Mostrami nella banda». sei_tu dice quale riga è la tua.
create or replace function public.banda(p_email text)
returns table(nick text, sei_tu boolean, aggiornato timestamptz, progressi jsonb)
language sql security definer set search_path = public as $$
  select
    coalesce(nullif(trim(p.dati->'state'->'settings'->>'nick'), ''), 'Giocatore ' || upper(left(md5(p.email), 4))),
    p.email = lower(trim(p_email)),
    p.aggiornato,
    jsonb_build_object(
      'missions',     coalesce(p.dati->'state'->'missions', '{}'::jsonb),
      'collectibles', coalesce(p.dati->'state'->'collectibles', '{}'::jsonb),
      'trophies',     coalesce(p.dati->'state'->'trophies', '{}'::jsonb),
      'activities',   coalesce(p.dati->'state'->'activities', '{}'::jsonb))
  from profili p
  where coalesce(p.dati->'state'->'settings'->>'banda', 'true') <> 'false'
  order by p.aggiornato desc
  limit 200;
$$;
revoke all on function public.banda(text) from public;
grant execute on function public.banda(text) to anon;

-- ---------- Scatti ----------
create table if not exists public.scatti (
  id uuid primary key default gen_random_uuid(),
  autore text not null,                 -- email (non esce mai dalle funzioni)
  percorso text not null,               -- file nel bucket «scatti»
  didascalia text not null default '',
  zona text not null default '',
  spoiler int not null default 0,       -- capitolo dopo il quale si può guardare (0 = nessuno spoiler)
  creato timestamptz not null default now(),
  nascosto boolean not null default false
);
create table if not exists public.scatti_like (
  scatto uuid not null references public.scatti(id) on delete cascade,
  chi text not null,
  primary key (scatto, chi)
);
create table if not exists public.scatti_commenti (
  id uuid primary key default gen_random_uuid(),
  scatto uuid not null references public.scatti(id) on delete cascade,
  chi text not null,
  testo text not null,
  creato timestamptz not null default now()
);
alter table public.scatti enable row level security;
alter table public.scatti_like enable row level security;
alter table public.scatti_commenti enable row level security;

-- nick di un'email (quello scelto nell'app, altrimenti «Giocatore XXXX»)
create or replace function public.leonida_nick(p_email text)
returns text language sql security definer set search_path = public stable as $$
  select coalesce(
    (select nullif(trim(dati->'state'->'settings'->>'nick'), '') from profili where email = lower(trim(p_email))),
    'Giocatore ' || upper(left(md5(lower(trim(p_email))), 4)));
$$;

create or replace function public.scatto_nuovo(p_email text, p_percorso text, p_didascalia text, p_zona text, p_spoiler int)
returns uuid language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email)); nuovo uuid;
begin
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'email non valida'; end if;
  if not exists (select 1 from profili where email = e) then raise exception 'entra prima con la tua email'; end if;
  if p_percorso !~ '^[0-9]{4}/[a-z0-9-]{8,60}\.jpg$' then raise exception 'percorso non valido'; end if;
  insert into scatti(autore, percorso, didascalia, zona, spoiler)
  values (e, p_percorso, left(coalesce(p_didascalia, ''), 280), left(coalesce(p_zona, ''), 60), greatest(0, least(coalesce(p_spoiler, 0), 9)))
  returning id into nuovo;
  return nuovo;
end $$;

create or replace function public.scatti_lista(p_email text)
returns table(id uuid, nick text, percorso text, didascalia text, zona text, spoiler int, creato timestamptz, mio boolean, likes int, piace boolean, commenti int)
language sql security definer set search_path = public stable as $$
  select s.id, leonida_nick(s.autore), s.percorso, s.didascalia, s.zona, s.spoiler, s.creato,
         s.autore = lower(trim(p_email)),
         (select count(*)::int from scatti_like l where l.scatto = s.id),
         exists (select 1 from scatti_like l where l.scatto = s.id and l.chi = lower(trim(p_email))),
         (select count(*)::int from scatti_commenti c where c.scatto = s.id)
  from scatti s where not s.nascosto
  order by s.creato desc limit 300;
$$;

create or replace function public.scatto_togli(p_email text, p_id uuid)
returns void language sql security definer set search_path = public as $$
  update scatti set nascosto = true where id = p_id and autore = lower(trim(p_email));
$$;

create or replace function public.scatto_piace(p_email text, p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email));
begin
  if not exists (select 1 from profili where email = e) then raise exception 'entra prima con la tua email'; end if;
  if exists (select 1 from scatti_like where scatto = p_id and chi = e) then
    delete from scatti_like where scatto = p_id and chi = e; return false;
  end if;
  insert into scatti_like(scatto, chi) values (p_id, e); return true;
end $$;

create or replace function public.scatto_commenta(p_email text, p_id uuid, p_testo text)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email));
begin
  if not exists (select 1 from profili where email = e) then raise exception 'entra prima con la tua email'; end if;
  if length(trim(coalesce(p_testo, ''))) = 0 then raise exception 'commento vuoto'; end if;
  insert into scatti_commenti(scatto, chi, testo) values (p_id, e, left(trim(p_testo), 500));
end $$;

create or replace function public.scatto_commenti(p_email text, p_id uuid)
returns table(id uuid, nick text, testo text, creato timestamptz, mio boolean)
language sql security definer set search_path = public stable as $$
  select c.id, leonida_nick(c.chi), c.testo, c.creato, c.chi = lower(trim(p_email))
  from scatti_commenti c where c.scatto = p_id order by c.creato asc limit 200;
$$;

create or replace function public.commento_togli(p_email text, p_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from scatti_commenti where id = p_id and chi = lower(trim(p_email));
$$;

do $$ declare f text; begin
  foreach f in array array['leonida_nick(text)', 'scatto_nuovo(text,text,text,text,int)', 'scatti_lista(text)', 'scatto_togli(text,uuid)',
                           'scatto_piace(text,uuid)', 'scatto_commenta(text,uuid,text)', 'scatto_commenti(text,uuid)', 'commento_togli(text,uuid)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon', f);
  end loop;
end $$;

-- Le foto: bucket pubblico «scatti» (crealo prima da Storage › New bucket, oppure lo crea questa riga).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scatti', 'scatti', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];
-- chiunque abbia l'app può caricare una foto nel bucket (solo jpeg, max 2 MB); nessuno può cancellare o sovrascrivere dall'app
drop policy if exists "leonida scatti caricano" on storage.objects;
create policy "leonida scatti caricano" on storage.objects for insert to anon with check (bucket_id = 'scatti');
