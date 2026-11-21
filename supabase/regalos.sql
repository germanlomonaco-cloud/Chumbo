-- Tabla de regalos de Chumbo.
-- Cómo usarlo: Supabase → proyecto "chumbo" → SQL Editor → New query → pegar todo esto → Run.

create table if not exists public.regalos (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,                 -- código para canjear (ej.: CHB-7K4PQX)
  para_nombre      text not null check (char_length(para_nombre) between 1 and 40),
  de_nombre        text not null check (char_length(de_nombre) between 1 and 40),
  ocasion          text not null,
  producto_id      text not null,
  producto_nombre  text not null,
  monto            integer not null check (monto > 0),   -- en pesos
  mensaje          text check (char_length(mensaje) <= 160),
  sorpresa         boolean not null default true,
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente', 'aprobado', 'rechazado')),
  vence            timestamptz,                          -- se fija cuando se aprueba el pago (30 días)
  canjeado         boolean not null default false,
  mp_preference_id text,
  mp_payment_id    text,
  creado           timestamptz not null default now(),
  actualizado      timestamptz not null default now()
);

-- Seguridad: RLS activado y sin políticas → nadie la toca desde el navegador; sólo nuestro servidor.
alter table public.regalos enable row level security;

-- Permisos para el servidor (service_role).
grant usage on schema public to service_role;
grant select, insert, update on table public.regalos to service_role;
