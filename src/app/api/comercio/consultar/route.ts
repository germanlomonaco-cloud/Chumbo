import { NextResponse } from "next/server";
import { canjeConsultar } from "@/lib/supabase";
import { leerPedido, responder, fallo } from "@/lib/canje";

// Muestra qué regalo es un código, SIN canjearlo.
export async function POST(req: Request) {
  const p = await leerPedido(req, true);
  if ("error" in p) return NextResponse.json({ ok: false, mensaje: p.error }, { status: 400 });
  try { return responder(await canjeConsultar(p.slug, p.pin, p.codigo)); } catch (e) { return fallo(e, "consultar"); }
}
