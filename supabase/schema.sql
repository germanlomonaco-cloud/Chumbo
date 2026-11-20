-- Tabla de propinas de Chumbo.
-- Cómo usarlo: Supabase → tu proyecto "chumbo" → SQL Editor → New query → pegar todo esto → Run.

create table if not exists public.propinas (
  id               uuid primary key default gen_random_uuid(),
  usuario          text not null,                       -- a quién va la propina (ej.: "german")
  monto            integer not null check (monto > 0),  -- en pesos
  mensaje          text check (char_length(mensaje) <= 140),
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente', 'aprobada', 'rechazada')),
  semillas         integer not null default 0,
  mp_preference_id text,                                -- cobro creado en Mercado Pago
  mp_payment_id    text,                                -- pago confirmado por el aviso (webhook)
  creado           timestamptz not null default now(),
  actualizado      timestamptz not null default now()
);

create index if not exists propinas_usuario_idx on public.propinas (usuario, creado desc);

-- Seguridad: activamos RLS y NO creamos políticas.
-- Así nadie puede leer ni modificar propinas desde el navegador;
-- sólo nuestro servidor, con la clave de servicio.
alter table public.propinas enable row level security;

-- Permisos para el servidor (service_role). Algunos proyectos nuevos de Supabase
-- no los dan solos para tablas creadas por SQL; sin esto el servidor recibe "403".
grant usage on schema public to service_role;
grant select, insert, update on table public.propinas to service_role;
