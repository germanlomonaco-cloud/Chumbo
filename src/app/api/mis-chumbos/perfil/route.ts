import { NextResponse } from "next/server";
import { COLORES } from "@/lib/perfiles";
import { actualizarPerfil } from "@/lib/supabase";
import { usuarioDeSesion } from "@/lib/sesion";

// Editar tu perfil (nombre, a qué te dedicás y color). Sólo con la sesión iniciada.
export async function PATCH(req: Request) {
  const usuario = await usuarioDeSesion();
  if (!usuario) return NextResponse.json({ error: "Tu sesión venció. Entrá de nuevo." }, { status: 401 });

  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }
  const nombre = String(d.nombre || "").replace(/\s+/g, " ").trim().slice(0, 40);
  const rol = String(d.rol || "").replace(/\s+/g, " ").trim().slice(0, 30);
  const color = String(d.color || "");
  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre" }, { status: 400 });
  if (!rol) return NextResponse.json({ error: "Elegí a qué te dedicás" }, { status: 400 });
  if (!COLORES.includes(color)) return NextResponse.json({ error: "Elegí un color" }, { status: 400 });

  try {
    await actualizarPerfil(usuario, { nombre, rol, color });
    return NextResponse.json({ ok: true, nombre });
  } catch (e) {
    console.error("mis-chumbos perfil:", e);
    return NextResponse.json({ error: "No pudimos guardar los cambios. Probá de nuevo." }, { status: 500 });
  }
}
