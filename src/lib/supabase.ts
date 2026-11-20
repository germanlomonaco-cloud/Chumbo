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
