import { NextResponse } from "next/server";
import { buscarPerfil, RESERVADOS, COLORES, USUARIO_VALIDO } from "@/lib/perfiles";
import { crearPerfil, leerPerfil } from "@/lib/supabase";
import { COOKIE_SESION, crearValorSesion, opcionesCookie } from "@/lib/sesion";

// ¿Está libre este link? (para avisar mientras la persona lo escribe)
export async function GET(req: Request) {
  const u = (new URL(req.url).searchParams.get("usuario") || "").toLowerCase();
  if (!USUARIO_VALIDO.test(u)) return NextResponse.json({ libre: false, motivo: "formato" });
  if (RESERVADOS.has(u)) return NextResponse.json({ libre: false, motivo: "ocupado" });
  if (await buscarPerfil(u)) return NextResponse.json({ libre: false, motivo: "ocupado" });
  try {
    const p = await leerPerfil(u);   // sin "atajar" el error: si la base falla, no decimos que está libre
    return NextResponse.json({ libre: !p, motivo: p ? "ocupado" : null });
  } catch (e) {
    console.error("perfiles GET:", e);
    return NextResponse.json({ libre: false, motivo: "error" });
  }
}

// Crea un perfil nuevo.
export async function POST(req: Request) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }

  // Trampa para robots: un campo oculto que una persona nunca completa.
  if (String(d.web || "").trim()) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const nombre = String(d.nombre || "").replace(/\s+/g, " ").trim().slice(0, 40);
  const usuario = String(d.usuario || "").toLowerCase().trim();
  const rol = String(d.rol || "").replace(/\s+/g, " ").trim().slice(0, 30);
  const color = String(d.color || "");
  const pin = String(d.pin || "");

  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre" }, { status: 400 });
  if (!USUARIO_VALIDO.test(usuario)) return NextResponse.json({ error: "El link tiene que tener entre 3 y 30 letras, números o guiones" }, { status: 400 });
  if (RESERVADOS.has(usuario)) return NextResponse.json({ error: "Ese link ya está tomado, probá con otro" }, { status: 409 });
  if (!rol) return NextResponse.json({ error: "Elegí a qué te dedicás" }, { status: 400 });
  if (!COLORES.includes(color)) return NextResponse.json({ error: "Elegí un color" }, { status: 400 });
  if (!/^\d{4,8}$/.test(pin)) return NextResponse.json({ error: "El PIN tiene que tener de 4 a 8 números" }, { status: 400 });
  if (/^(\d)\1+$/.test(pin) || "0123456789".includes(pin) || "9876543210".includes(pin)) {
    return NextResponse.json({ error: "Ese PIN es muy fácil de adivinar, elegí otro" }, { status: 400 });
  }

  try {
    const r = await crearPerfil({ usuario, nombre, rol, color, pin });
    if (!r.ok) {
      const msg = r.error === "ocupado" ? "Ese link ya está tomado, probá con otro" : "Revisá los datos e intentá de nuevo";
      return NextResponse.json({ error: msg }, { status: r.error === "ocupado" ? 409 : 400 });
    }
    // Recién creado: ya queda con la sesión iniciada para ver "Mis Chumbos".
    const res = NextResponse.json({ ok: true, usuario });
    res.cookies.set(COOKIE_SESION, crearValorSesion(usuario), opcionesCookie);
    return res;
  } catch (e) {
    console.error("perfiles:", e);
    return NextResponse.json({ error: "No pudimos crear tu perfil. Probá de nuevo en un rato." }, { status: 500 });
  }
}
