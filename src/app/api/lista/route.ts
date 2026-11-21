import { NextResponse } from "next/server";
import { anotarEnLista } from "@/lib/supabase";

// Anota a alguien en la lista de espera. Acepta un mail o un número de WhatsApp.
export async function POST(req: Request) {
  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }

  // Trampa para robots: un campo oculto que una persona nunca completa.
  if (String(d.web || "").trim()) return NextResponse.json({ ok: true });

  const nombre = String(d.nombre || "").replace(/\s+/g, " ").trim().slice(0, 60);
  const bruto = String(d.contacto || "").trim().slice(0, 120);
  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre" }, { status: 400 });

  let contacto: string, tipo: "email" | "whatsapp";
  if (bruto.includes("@")) {
    contacto = bruto.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contacto)) return NextResponse.json({ error: "Revisá el mail" }, { status: 400 });
    tipo = "email";
  } else {
    const digitos = bruto.replace(/\D/g, "");
    if (digitos.length < 8 || digitos.length > 15) return NextResponse.json({ error: "Revisá el número de WhatsApp" }, { status: 400 });
    contacto = "+" + digitos;
    tipo = "whatsapp";
  }
  const origen = String(d.origen || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 30) || null;

  try {
    const r = await anotarEnLista({ nombre, contacto, tipo, origen });
    return NextResponse.json({ ok: true, repetido: r === "repetido" });
  } catch (e) {
    console.error("lista:", e);
    return NextResponse.json({ error: "No pudimos anotarte. Probá de nuevo en un rato." }, { status: 500 });
  }
}
