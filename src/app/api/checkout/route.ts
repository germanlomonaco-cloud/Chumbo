import { NextResponse } from "next/server";
import { buscarPerfil } from "@/lib/perfiles";
import { MONTOS, MENSAJE_MAX } from "@/lib/reglas";
import { crearPropina, actualizarPropina } from "@/lib/supabase";
import { asegurarModoPrueba, crearPreferencia } from "@/lib/mercadopago";
import { env } from "@/lib/env";

// Crea la propina (pendiente) y el cobro en Mercado Pago. Devuelve la dirección del checkout.
export async function POST(req: Request) {
  let datos: { usuario?: string; monto?: number; mensaje?: string };
  try { datos = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }

  const perfil = buscarPerfil(String(datos.usuario || ""));
  if (!perfil) return NextResponse.json({ error: "Perfil inexistente" }, { status: 404 });

  const monto = Number(datos.monto);
  if (!MONTOS.includes(monto as (typeof MONTOS)[number])) {
    return NextResponse.json({ error: "Monto no permitido" }, { status: 400 });
  }
  const mensaje = String(datos.mensaje || "").trim().slice(0, MENSAJE_MAX) || null;

  try {
    await asegurarModoPrueba();
    const propina = await crearPropina({ usuario: perfil.usuario, monto, mensaje });
    const pref = await crearPreferencia({ propinaId: propina.id, usuario: perfil.usuario, nombre: perfil.nombre, monto });
    await actualizarPropina(propina.id, { mp_preference_id: pref.id });
    // Con credenciales "TEST-" Mercado Pago usa el checkout de pruebas (sandbox).
    const url = env.mpAccessToken().startsWith("TEST-") && pref.sandbox_init_point ? pref.sandbox_init_point : pref.init_point;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("checkout:", e);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Probá de nuevo en un rato." }, { status: 500 });
  }
}
