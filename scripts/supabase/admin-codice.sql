-- Leonida · il codice admin di Mike. Si lancia UNA volta (e ogni volta che vuoi cambiare codice).
-- Cambia SOLO la scritta tra i due apici nella riga qui sotto che comincia con «declare»:
-- gli apici ' ' devono restare, e il resto del testo non si tocca.
-- Il codice: almeno 8 caratteri, con almeno un numero. Non scriverlo in chat e non mandare screenshot di questa pagina.
create table if not exists public.leonida_admin (impronta text primary key);
alter table public.leonida_admin enable row level security;

do $$
declare codice text := 'CODICE-TRA-GLI-APICI';
begin
  if length(codice) < 8 or codice !~ '[0-9]' then
    raise exception 'Il codice deve avere almeno 8 caratteri e almeno un numero: scrivilo tra gli apici nella riga «declare» e premi di nuovo Run.';
  end if;
  delete from public.leonida_admin;
  insert into public.leonida_admin(impronta) values (encode(sha256(convert_to(codice, 'UTF8')), 'hex'));
end $$;
