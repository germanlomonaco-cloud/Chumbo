-- Perfiles reales de Chumbo (cada persona con su link y su QR para recibir propinas).
-- Cómo usarlo: Supabase → proyecto "chumbo" → SQL Editor → New query → pegar todo esto → Run.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.perfiles (
  usuario          text primary key check (usuario ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'),  -- el link: chumbo.app/<usuario>
  nombre           text not null check (char_length(nombre) between 1 and 40),
  rol              text not null check (char_length(rol) between 1 and 30),
  color            text not null default '#f2b46b' check (color ~ '^#[0-9a-f]{6}$'),
  pin_hash         text not null,                       -- PIN cifrado (para entrar a "Mis Chumbos" más adelante)
  intentos         integer not null default 0,
  bloqueado_hasta  timestamptz,
  creado           timestamptz not null default now()
);
alter table public.perfiles enable row level security;

-- Crea un perfil. El PIN se cifra acá adentro: nunca se guarda en texto.
create or replace function public.perfil_crear(p_usuario text, p_nombre text, p_rol text, p_color text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_pin !~ '^\d{4,8}$' then return json_build_object('ok', false, 'error', 'pin_invalido'); end if;
  insert into public.perfiles (usuario, nombre, rol, color, pin_hash)
  values (lower(trim(p_usuario)), trim(p_nombre), trim(p_rol), lower(p_color), extensions.crypt(p_pin, extensions.gen_salt('bf')));
  return json_build_object('ok', true, 'usuario', lower(trim(p_usuario)));
exception
  when unique_violation then return json_build_object('ok', false, 'error', 'ocupado');
  when check_violation then return json_build_object('ok', false, 'error', 'datos_invalidos');
end $$;

-- Verifica usuario + PIN, con bloqueo por intentos fallidos (5 → 15 minutos). Para "Mis Chumbos".
create or replace function public.perfil_login(p_usuario text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare p public.perfiles%rowtype;
begin
  select * into p from public.perfiles where usuario = lower(trim(p_usuario));
  if not found then return json_build_object('ok', false, 'error', 'datos_incorrectos'); end if;
  if p.bloqueado_hasta is not null and p.bloqueado_hasta > now() then
    return json_build_object('ok', false, 'error', 'bloqueado');
  end if;
  if extensions.crypt(p_pin, p.pin_hash) <> p.pin_hash then
    update public.perfiles
       set intentos = intentos + 1,
           bloqueado_hasta = case when intentos + 1 >= 5 then now() + interval '15 minutes' else null end
     where usuario = p.usuario;
    return json_build_object('ok', false, 'error', 'datos_incorrectos');
  end if;
  update public.perfiles set intentos = 0, bloqueado_hasta = null where usuario = p.usuario;
  return json_build_object('ok', true, 'usuario', p.usuario, 'nombre', p.nombre);
end $$;

-- Sólo nuestro servidor puede usar la tabla y las funciones
revoke all on function public.perfil_crear(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.perfil_login(text, text) from public, anon, authenticated;
grant execute on function public.perfil_crear(text, text, text, text, text) to service_role;
grant execute on function public.perfil_login(text, text) to service_role;
grant select, insert, update on table public.perfiles to service_role;
