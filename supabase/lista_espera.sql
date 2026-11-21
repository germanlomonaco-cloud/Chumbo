-- Lista de espera de Chumbo (gente que quiere enterarse del lanzamiento).
-- Cómo usarlo: Supabase → proyecto "chumbo" → SQL Editor → New query → pegar todo esto → Run.

create table if not exists public.lista_espera (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null check (char_length(nombre) between 1 and 60),
  contacto  text not null unique check (char_length(contacto) between 5 and 120),  -- mail o WhatsApp
  tipo      text not null check (tipo in ('email', 'whatsapp')),
  origen    text,                                                                   -- de dónde vino (ej.: instagram)
  creado    timestamptz not null default now()
);

-- Seguridad: RLS activado y sin políticas → nadie la lee desde el navegador; sólo nuestro servidor.
alter table public.lista_espera enable row level security;
grant usage on schema public to service_role;
grant select, insert on table public.lista_espera to service_role;
