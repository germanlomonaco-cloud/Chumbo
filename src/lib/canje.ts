import { NextResponse } from "next/server";
import type { RespuestaCanje } from "./supabase";

// Datos que manda el panel del comercio. Se validan antes de llegar a la base.
export async function leerPedido(req: Request, conCodigo: boolean) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return { error: "Datos inválidos" } as const; }
  const slug = String(d.slug || "").trim().toLowerCase();
  const pin = String(d.pin || "").trim();
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return { error: "Revisá el código de comercio" } as const;
  if (!/^\d{4,12}$/.test(pin)) return { error: "El PIN son sólo números (4 a 12)" } as const;
  if (!conCodigo) return { slug, pin, codigo: "" } as const;
  // Acepta "CHB-7K4PQX", "chb7k4pqx" o "7K4PQX"
  let codigo = String(d.codigo || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (codigo.startsWith("CHB")) codigo = codigo.slice(3);
  if (!/^[2-9A-Z]{6}$/.test(codigo)) return { error: "El código tiene 6 letras o números después de CHB-" } as const;
  return { slug, pin, codigo: "CHB-" + codigo } as const;
}

const MENSAJES: Record<string, string> = {
  datos_incorrectos: "Código de comercio o PIN incorrectos",
  bloqueado: "Demasiados intentos. Probá de nuevo en 15 minutos",
};

// Respuesta al navegador. Los errores de login van con 401; los del regalo, como resultado normal.
export function responder(r: RespuestaCanje) {
  if (!r.ok && r.error && r.error in MENSAJES) return NextResponse.json({ ok: false, error: r.error, mensaje: MENSAJES[r.error] }, { status: 401 });
  return NextResponse.json(r);
}

export function fallo(e: unknown, donde: string) {
  console.error(`comercio ${donde}:`, e);
  return NextResponse.json({ ok: false, mensaje: "No pudimos conectarnos. Probá de nuevo." }, { status: 500 });
}
