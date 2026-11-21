import { NextResponse } from "next/server";
import { leerRegalo } from "@/lib/supabase";

// Estado de un regalo (lo consulta la pantalla de "listo" mientras espera el aviso de Mercado Pago).
// El código para compartir sólo se entrega cuando el pago está aprobado.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await leerRegalo(id).catch(() => null);
  if (!r) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ estado: r.estado, codigo: r.estado === "aprobado" ? r.codigo : null });
}
