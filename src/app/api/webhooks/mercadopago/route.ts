import { NextResponse } from "next/server";
import { firmaValida, obtenerPago } from "@/lib/mercadopago";
import { leerPropina, actualizarPropina, type EstadoPropina } from "@/lib/supabase";
import { semillasPara } from "@/lib/reglas";

// Aviso (webhook) de Mercado Pago. ÚNICO lugar donde una propina pasa a "aprobada".
// 1) Verificamos la firma: que el aviso venga de verdad de Mercado Pago.
// 2) No confiamos en lo que dice el aviso: le preguntamos a Mercado Pago el estado real del pago.
// 3) Controlamos que el pago corresponda a la propina (referencia, monto y moneda).
export async function POST(req: Request) {
  const url = new URL(req.url);
  const cuerpo = await req.json().catch(() => ({} as Record<string, unknown>));
  const tipo = String(url.searchParams.get("type") || cuerpo.type || url.searchParams.get("topic") || "");
  const dataId = url.searchParams.get("data.id") || (cuerpo.data as { id?: string } | undefined)?.id || null;

  if (!firmaValida({ xSignature: req.headers.get("x-signature"), xRequestId: req.headers.get("x-request-id"), dataId: dataId ? String(dataId) : null })) {
    console.warn("webhook: firma inválida");
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (tipo !== "payment" || !dataId) return NextResponse.json({ ok: true, ignorado: tipo });

  try {
    const pago = await obtenerPago(String(dataId));
    const propina = pago.external_reference ? await leerPropina(pago.external_reference) : null;
    if (!propina) { console.warn("webhook: pago sin propina", pago.id); return NextResponse.json({ ok: true }); }

    if (pago.currency_id !== "ARS" || Number(pago.transaction_amount) !== propina.monto) {
      console.warn("webhook: monto o moneda no coinciden", pago.id, propina.id);
      return NextResponse.json({ ok: true });
    }
    // Una propina aprobada no vuelve atrás por avisos viejos o repetidos.
    if (propina.estado === "aprobada") return NextResponse.json({ ok: true });

    const estado: EstadoPropina = pago.status === "approved" ? "aprobada"
      : ["rejected", "cancelled", "refunded", "charged_back"].includes(pago.status) ? "rechazada" : "pendiente";
    await actualizarPropina(propina.id, {
      estado, mp_payment_id: String(pago.id), semillas: estado === "aprobada" ? semillasPara(propina.monto) : 0,
    });
    return NextResponse.json({ ok: true, estado });
  } catch (e) {
    console.error("webhook:", e);
    // 500 = Mercado Pago reintenta el aviso más tarde.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
