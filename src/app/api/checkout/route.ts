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

  const perfil = await buscarPerfil(String(datos.usuario || ""));
  if (!perfil) return NextResponse.json({ error: "Perfil inexistente" }, { status: 404 });

  const monto = Number(datos.monto);
  if (!MONTOS.includes(monto as (typeof MONTOS)[number])) {
    return NextResponse.json({ error: "Monto no permitido" }, { status: 400 });
  }
  const mensaje = String(datos.mensaje || "").trim().slice(0, MENSAJE_MAX) || null;

  // "paso" indica dónde falló, para diagnosticar sin mostrar ninguna clave:
  // MP1 = credencial de Mercado Pago · DB1 = guardar en Supabase · MP2 = crear el cobro · DB2 = actualizar en Supabase
  let paso = "MP1";
  try {
    await asegurarModoPrueba();
    paso = "DB1";
    const propina = await crearPropina({ usuario: perfil.usuario, monto, mensaje });
    paso = "MP2";
    const pref = await crearPreferencia({ propinaId: propina.id, usuario: perfil.usuario, nombre: perfil.nombre, monto });
    paso = "DB2";
    await actualizarPropina(propina.id, { mp_preference_id: pref.id });
    // Con credenciales "TEST-" Mercado Pago usa el checkout de pruebas (sandbox).
    const url = env.mpAccessToken().startsWith("TEST-") && pref.sandbox_init_point ? pref.sandbox_init_point : pref.init_point;
    return NextResponse.json({ url });
  } catch (e) {
    console.error(`checkout [${paso}]:`, e);
    const msg = e instanceof Error ? e.message : "";
    // Sólo datos seguros: nombre de variable faltante o código HTTP (nunca claves).
    const pista = msg.match(/Falta la variable de entorno (\w+)/)?.[1] || msg.match(/^(Supabase|Mercado Pago) (\d{3})/)?.slice(1).join(" ")
      || (msg.includes("no es de prueba") ? "credencial no es de prueba" : "");
    return NextResponse.json({ error: `No pudimos iniciar el pago (código ${paso}${pista ? " · " + pista : ""}).` }, { status: 500 });
  }
}
