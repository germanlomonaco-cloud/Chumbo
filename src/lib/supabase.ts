import { env } from "./env";

// Acceso a la tabla "propinas" de Supabase desde el servidor (con la clave de servicio).
// La tabla tiene RLS activado y sin políticas: nadie puede leerla ni escribirla desde el navegador.
export type EstadoPropina = "pendiente" | "aprobada" | "rechazada";
export type Propina = {
  id: string; usuario: string; monto: number; mensaje: string | null;
  estado: EstadoPropina; semillas: number; mp_payment_id: string | null; mp_preference_id?: string | null; creado: string;
};

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = env.supabaseServiceKey();
  const r = await fetch(`${env.supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    // Las claves nuevas de Supabase (sb_secret_...) van sólo en "apikey"; las clásicas (service_role) también como Bearer.
    headers: { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }), "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) },
    cache: "no-store",
  });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body as T;
}

export async function crearPropina(p: { usuario: string; monto: number; mensaje: string | null }) {
  const [fila] = await rest<Propina[]>("propinas", { method: "POST", body: JSON.stringify({ ...p, estado: "pendiente" }) });
  return fila;
}

export async function leerPropina(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const filas = await rest<Propina[]>(`propinas?id=eq.${id}&select=*`);
  return filas[0] ?? null;
}

export async function actualizarPropina(id: string, cambios: Partial<Propina>) {
  const filas = await rest<Propina[]>(`propinas?id=eq.${id}`, {
    method: "PATCH", body: JSON.stringify({ ...cambios, actualizado: new Date().toISOString() }),
  });
  return filas[0] ?? null;
}

// ===== Regalos =====
export type EstadoRegalo = "pendiente" | "aprobado" | "rechazado";
export type Regalo = {
  id: string; codigo: string; para_nombre: string; de_nombre: string; ocasion: string;
  producto_id: string; producto_nombre: string; monto: number; mensaje: string | null; sorpresa: boolean;
  estado: EstadoRegalo; vence: string | null; canjeado: boolean; canjeado_en?: string | null;
  mp_preference_id: string | null; mp_payment_id: string | null; creado: string;
};

// Código para canjear: CHB- + 6 caracteres sin letras confusas (sin 0/O, 1/I/L).
function nuevoCodigo() {
  const abc = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "CHB-" + Array.from(bytes, b => abc[b % abc.length]).join("");
}

export async function crearRegalo(r: Pick<Regalo, "para_nombre" | "de_nombre" | "ocasion" | "producto_id" | "producto_nombre" | "monto" | "mensaje" | "sorpresa">) {
  for (let intento = 0; intento < 3; intento++) {
    try {
      const [fila] = await rest<Regalo[]>("regalos", { method: "POST", body: JSON.stringify({ ...r, codigo: nuevoCodigo(), estado: "pendiente" }) });
      return fila;
    } catch (e) {
      // Si el código ya existía (muy improbable), probamos con otro.
      if (!(e instanceof Error && e.message.includes("23505")) || intento === 2) throw e;
    }
  }
  throw new Error("No se pudo crear el regalo");
}

export async function leerRegalo(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const filas = await rest<Regalo[]>(`regalos?id=eq.${id}&select=*`);
  return filas[0] ?? null;
}

export async function leerRegaloPorCodigo(codigo: string) {
  if (!/^CHB-[2-9A-Z]{6}$/.test(codigo)) return null;
  const filas = await rest<Regalo[]>(`regalos?codigo=eq.${codigo}&select=*`);
  return filas[0] ?? null;
}

export async function actualizarRegalo(id: string, cambios: Partial<Regalo>) {
  const filas = await rest<Regalo[]>(`regalos?id=eq.${id}`, {
    method: "PATCH", body: JSON.stringify({ ...cambios, actualizado: new Date().toISOString() }),
  });
  return filas[0] ?? null;
}

// ===== Lista de espera =====
export async function anotarEnLista(p: { nombre: string; contacto: string; tipo: "email" | "whatsapp"; origen: string | null }) {
  try {
    await rest("lista_espera", { method: "POST", body: JSON.stringify(p), headers: { Prefer: "return=minimal" } });
    return "nuevo" as const;
  } catch (e) {
    // Si ya estaba anotado (contacto repetido), lo tomamos como éxito.
    if (e instanceof Error && e.message.includes("23505")) return "repetido" as const;
    throw e;
  }
}

// ===== Comercios y canje (funciones de la base: verifican el PIN y canjean de forma atómica) =====
export type RespuestaCanje = {
  ok: boolean; error?: "datos_incorrectos" | "bloqueado" | "no_existe" | "no_pagado" | "canjeado" | "vencido";
  nombre?: string; producto?: string; para?: string; de?: string; monto?: number; vence?: string | null;
  canjeado?: boolean; canjeado_en?: string | null;
};
const rpc = (fn: string, args: Record<string, string>) => rest<RespuestaCanje>(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
export const comercioLogin = (slug: string, pin: string) => rpc("comercio_login", { p_slug: slug, p_pin: pin });
export const canjeConsultar = (slug: string, pin: string, codigo: string) => rpc("canje_consultar", { p_slug: slug, p_pin: pin, p_codigo: codigo });
export const canjeConfirmar = (slug: string, pin: string, codigo: string) => rpc("canje_confirmar", { p_slug: slug, p_pin: pin, p_codigo: codigo });

// ===== Perfiles (cada persona con su link para recibir propinas) =====
export async function leerPerfil(usuario: string) {
  const filas = await rest<{ usuario: string; nombre: string; rol: string; color: string }[]>(
    `perfiles?usuario=eq.${encodeURIComponent(usuario)}&select=usuario,nombre,rol,color`);
  return filas[0] ?? null;
}

export async function crearPerfil(p: { usuario: string; nombre: string; rol: string; color: string; pin: string }) {
  return rest<{ ok: boolean; usuario?: string; error?: "ocupado" | "pin_invalido" | "datos_invalidos" }>("rpc/perfil_crear", {
    method: "POST", body: JSON.stringify({ p_usuario: p.usuario, p_nombre: p.nombre, p_rol: p.rol, p_color: p.color, p_pin: p.pin }),
  });
}

export async function perfilLogin(usuario: string, pin: string) {
  return rest<{ ok: boolean; usuario?: string; nombre?: string; error?: "datos_incorrectos" | "bloqueado" }>("rpc/perfil_login", {
    method: "POST", body: JSON.stringify({ p_usuario: usuario, p_pin: pin }),
  });
}

export async function actualizarPerfil(usuario: string, cambios: { nombre: string; rol: string; color: string }) {
  const filas = await rest<{ usuario: string }[]>(`perfiles?usuario=eq.${encodeURIComponent(usuario)}`, {
    method: "PATCH", body: JSON.stringify(cambios),
  });
  return filas[0] ?? null;
}

// Propinas cobradas de una persona (las más nuevas primero)
export async function propinasDe(usuario: string) {
  return rest<Pick<Propina, "id" | "monto" | "mensaje" | "semillas" | "creado">[]>(
    `propinas?usuario=eq.${encodeURIComponent(usuario)}&estado=eq.aprobada&select=id,monto,mensaje,semillas,creado&order=creado.desc&limit=500`);
}
