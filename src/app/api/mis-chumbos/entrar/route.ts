import { NextResponse } from "next/server";
import { USUARIO_VALIDO } from "@/lib/perfiles";
import { perfilLogin } from "@/lib/supabase";
import { COOKIE_SESION, crearValorSesion, opcionesCookie } from "@/lib/sesion";

// Entrar a "Mis Chumbos" con tu link + PIN. Si es correcto, deja la sesión guardada en el celu.
export async function POST(req: Request) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }
  const usuario = String(d.usuario || "").toLowerCase().trim().replace(/^.*\//, "");   // acepta también el link entero
  const pin = String(d.pin || "");
  if (!USUARIO_VALIDO.test(usuario) || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: "Link o PIN incorrectos" }, { status: 401 });
  }
  try {
    const r = await perfilLogin(usuario, pin);
    if (!r.ok) {
      const error = r.error === "bloqueado" ? "Demasiados intentos. Esperá 15 minutos y probá de nuevo." : "Link o PIN incorrectos";
      return NextResponse.json({ error }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, usuario: r.usuario, nombre: r.nombre });
    res.cookies.set(COOKIE_SESION, crearValorSesion(r.usuario!), opcionesCookie);
    return res;
  } catch (e) {
    console.error("mis-chumbos entrar:", e);
    return NextResponse.json({ error: "No pudimos entrar. Probá de nuevo en un rato." }, { status: 500 });
  }
}
