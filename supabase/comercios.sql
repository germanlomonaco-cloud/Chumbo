-- Comercios y canje de regalos de Chumbo.
-- Cómo usarlo: Supabase → proyecto "chumbo" → SQL Editor → New query → pegar todo esto → Run.

create extension if not exists pgcrypto with schema extensions;

-- Comercios adheridos. El PIN se guarda cifrado (como una contraseña), nunca en texto.
create table if not exists public.comercios (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,                -- código del comercio para entrar (ej.: "prueba")
  nombre           text not null,
  pin_hash         text not null,
  intentos         integer not null default 0,          -- PIN incorrectos seguidos
  bloqueado_hasta  timestamptz,                         -- 5 intentos fallidos → 15 minutos bloqueado
  creado           timestamptz not null default now()
);
alter table public.comercios enable row level security;

-- Datos del canje en cada regalo
alter table public.regalos add column if not exists canjeado_en  timestamptz;
alter table public.regalos add column if not exists canjeado_por uuid references public.comercios(id);

-- ===== Funciones (corren dentro de la base, de forma segura y atómica) =====

-- Verifica código de comercio + PIN, con bloqueo por intentos fallidos.
create or replace function public.comercio_login(p_slug text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare c public.comercios%rowtype;
begin
  select * into c from public.comercios where slug = lower(trim(p_slug));
  if not found then return json_build_object('ok', false, 'error', 'datos_incorrectos'); end if;
  if c.bloqueado_hasta is not null and c.bloqueado_hasta > now() then
    return json_build_object('ok', false, 'error', 'bloqueado');
  end if;
  if extensions.crypt(p_pin, c.pin_hash) <> c.pin_hash then
    update public.comercios
       set intentos = intentos + 1,
           bloqueado_hasta = case when intentos + 1 >= 5 then now() + interval '15 minutes' else null end
     where id = c.id;
    return json_build_object('ok', false, 'error', 'datos_incorrectos');
  end if;
  update public.comercios set intentos = 0, bloqueado_hasta = null where id = c.id;
  return json_build_object('ok', true, 'id', c.id, 'nombre', c.nombre);
end $$;

-- Consulta un código SIN canjearlo (para mostrar qué regalo es).
create or replace function public.canje_consultar(p_slug text, p_pin text, p_codigo text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare l json; r public.regalos%rowtype;
begin
  l := public.comercio_login(p_slug, p_pin);
  if not (l->>'ok')::boolean then return l; end if;
  select * into r from public.regalos where codigo = upper(trim(p_codigo));
  if not found then return json_build_object('ok', false, 'error', 'no_existe'); end if;
  if r.estado <> 'aprobado' then return json_build_object('ok', false, 'error', 'no_pagado'); end if;
  if r.canjeado then return json_build_object('ok', false, 'error', 'canjeado', 'canjeado_en', r.canjeado_en); end if;
  if r.vence is not null and r.vence < now() then return json_build_object('ok', false, 'error', 'vencido', 'vence', r.vence); end if;
  return json_build_object('ok', true, 'producto', r.producto_nombre, 'para', r.para_nombre, 'de', r.de_nombre, 'monto', r.monto, 'vence', r.vence);
end $$;

-- Canjea un código. Atómico: aunque dos cajas lo intenten a la vez, sólo una puede.
create or replace function public.canje_confirmar(p_slug text, p_pin text, p_codigo text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare l json; r public.regalos%rowtype;
begin
  l := public.comercio_login(p_slug, p_pin);
  if not (l->>'ok')::boolean then return l; end if;
  update public.regalos
     set canjeado = true, canjeado_en = now(), canjeado_por = (l->>'id')::uuid, actualizado = now()
   where codigo = upper(trim(p_codigo)) and estado = 'aprobado' and canjeado = false
     and (vence is null or vence >= now())
  returning * into r;
  if not found then return public.canje_consultar(p_slug, p_pin, p_codigo); end if;   -- explica por qué no
  return json_build_object('ok', true, 'canjeado', true, 'producto', r.producto_nombre, 'para', r.para_nombre, 'canjeado_en', r.canjeado_en);
end $$;

-- Sólo nuestro servidor puede usar estas funciones
revoke all on function public.comercio_login(text, text) from public, anon, authenticated;
revoke all on function public.canje_consultar(text, text, text) from public, anon, authenticated;
revoke all on function public.canje_confirmar(text, text, text) from public, anon, authenticated;
grant execute on function public.comercio_login(text, text) to service_role;
grant execute on function public.canje_consultar(text, text, text) to service_role;
grant execute on function public.canje_confirmar(text, text, text) to service_role;
grant select, insert, update on table public.comercios to service_role;
