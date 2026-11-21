import { NextResponse } from "next/server";
import { canjeConfirmar } from "@/lib/supabase";
import { leerPedido, responder, fallo } from "@/lib/canje";

// Canjea el regalo (lo marca como usado). La base garantiza que sólo se pueda usar una vez.
export async function POST(req: Request) {
  const p = await leerPedido(req, true);
  if ("error" in p) return NextResponse.json({ ok: false, mensaje: p.error }, { status: 400 });
  try { return responder(await canjeConfirmar(p.slug, p.pin, p.codigo)); } catch (e) { return fallo(e, "canjear"); }
}
