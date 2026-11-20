import { NextResponse } from "next/server";
import { leerPropina } from "@/lib/supabase";

// Estado de una propina (lo consulta la pantalla de confirmación mientras espera el aviso de Mercado Pago).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await leerPropina(id).catch(() => null);
  if (!p) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ estado: p.estado, semillas: p.semillas, monto: p.monto });
}
