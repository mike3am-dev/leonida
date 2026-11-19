-- Leonida · il codice admin di Mike. Si lancia UNA volta (e ogni volta che vuoi cambiare codice).
-- 1) Sostituisci SCRIVI-QUI-IL-TUO-CODICE qui sotto con un codice tuo, di almeno 8 caratteri (lettere e numeri).
-- 2) Premi Run. Il codice NON viene salvato in chiaro: nel database resta solo la sua impronta.
-- 3) Non scrivere mai il codice in chat e non salvare questo file con il codice dentro.
create table if not exists public.leonida_admin (impronta text primary key);
alter table public.leonida_admin enable row level security;

do $$
declare codice text := 'SCRIVI-QUI-IL-TUO-CODICE';
begin
  if codice = 'SCRIVI-QUI-IL-TUO-CODICE' or length(codice) < 8 then
    raise exception 'Prima scrivi il tuo codice (almeno 8 caratteri) al posto di SCRIVI-QUI-IL-TUO-CODICE, poi premi di nuovo Run.';
  end if;
  delete from public.leonida_admin;
  insert into public.leonida_admin(impronta) values (encode(sha256(convert_to(codice, 'UTF8')), 'hex'));
end $$;
