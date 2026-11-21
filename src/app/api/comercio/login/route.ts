import { NextResponse } from "next/server";
import { comercioLogin } from "@/lib/supabase";
import { leerPedido, responder, fallo } from "@/lib/canje";

export async function POST(req: Request) {
  const p = await leerPedido(req, false);
  if ("error" in p) return NextResponse.json({ ok: false, mensaje: p.error }, { status: 400 });
  try { return responder(await comercioLogin(p.slug, p.pin)); } catch (e) { return fallo(e, "login"); }
}
