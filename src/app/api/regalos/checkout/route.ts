import { NextResponse } from "next/server";
import { buscarProducto, OCASIONES, MENSAJE_REGALO_MAX, NOMBRE_MAX } from "@/lib/catalogo";
import { crearRegalo, actualizarRegalo } from "@/lib/supabase";
import { asegurarModoPrueba, crearCobro, urlCheckout } from "@/lib/mercadopago";
import { env } from "@/lib/env";

const limpiar = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Crea el regalo (pendiente) y su cobro en Mercado Pago. El precio sale SIEMPRE del catálogo del servidor.
export async function POST(req: Request) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }

  const producto = buscarProducto(String(d.producto || ""));
  if (!producto) return NextResponse.json({ error: "Elegí un regalo" }, { status: 400 });
  const ocasion = OCASIONES.find(o => o.id === d.ocasion)?.id;
  if (!ocasion) return NextResponse.json({ error: "Elegí una ocasión" }, { status: 400 });
  const para = limpiar(d.para, NOMBRE_MAX), de = limpiar(d.de, NOMBRE_MAX);
  if (!para) return NextResponse.json({ error: "Escribí para quién es" }, { status: 400 });
  if (!de) return NextResponse.json({ error: "Escribí tu nombre" }, { status: 400 });
  const mensaje = limpiar(d.mensaje, MENSAJE_REGALO_MAX) || null;

  let paso = "MP1";
  try {
    await asegurarModoPrueba();
    paso = "DB1";
    const regalo = await crearRegalo({
      para_nombre: para, de_nombre: de, ocasion, producto_id: producto.id, producto_nombre: producto.nombre,
      monto: producto.precio, mensaje, sorpresa: d.sorpresa !== false,
    });
    paso = "MP2";
    const pref = await crearCobro({
      referencia: `regalo:${regalo.id}`, idItem: producto.id, titulo: `Chumbo para ${para}: ${producto.nombre}`,
      monto: producto.precio, vuelta: `${env.siteUrl()}/regalar/listo?regalo=${regalo.id}`,
    });
    paso = "DB2";
    await actualizarRegalo(regalo.id, { mp_preference_id: pref.id });
    return NextResponse.json({ url: urlCheckout(pref) });
  } catch (e) {
    console.error(`regalo checkout [${paso}]:`, e);
    const msg = e instanceof Error ? e.message : "";
    const pista = msg.match(/^(Supabase|Mercado Pago) (\d{3})/)?.slice(1).join(" ") || "";
    return NextResponse.json({ error: `No pudimos iniciar el pago (código ${paso}${pista ? " · " + pista : ""}).` }, { status: 500 });
  }
}
