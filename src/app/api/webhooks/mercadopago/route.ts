import { NextResponse } from "next/server";
import { firmaValida, obtenerPago } from "@/lib/mercadopago";
import { leerPropina, actualizarPropina, type EstadoPropina } from "@/lib/supabase";
import { semillasPara } from "@/lib/reglas";

// Aviso de Mercado Pago (Webhooks o IPN). ÚNICO lugar donde una propina pasa a "aprobada".
// 1) Si el aviso viene firmado (Webhooks con clave secreta), verificamos la firma: una firma falsa se rechaza.
//    Los avisos IPN no traen firma: se aceptan, pero igual pasan por los controles 2 y 3.
// 2) No confiamos en lo que dice el aviso: le preguntamos a Mercado Pago el estado real del pago, con nuestro Access Token.
// 3) Controlamos que el pago corresponda a la propina (referencia, monto y moneda).
// Así, un aviso inventado no puede aprobar nada: la decisión sale siempre de la respuesta de Mercado Pago.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const cuerpo = await req.json().catch(() => ({} as Record<string, unknown>));
  const topic = url.searchParams.get("topic");                       // formato IPN: ?topic=payment&id=123
  const tipo = String(url.searchParams.get("type") || cuerpo.type || topic || cuerpo.topic || "");
  const dataId = url.searchParams.get("data.id") || (cuerpo.data as { id?: string } | undefined)?.id
    || (topic ? url.searchParams.get("id") : null) || null;

  const firma = req.headers.get("x-signature");
  if (firma && process.env.MP_WEBHOOK_SECRET &&
      !firmaValida({ xSignature: firma, xRequestId: req.headers.get("x-request-id"), dataId: dataId ? String(dataId) : null })) {
    console.warn("webhook: firma inválida");
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (tipo !== "payment" || !dataId) return NextResponse.json({ ok: true, ignorado: tipo || "sin tipo" });

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
    // Pago inexistente (por ejemplo, el botón "Probar" de Mercado Pago): no hay nada que hacer.
    if (e instanceof Error && e.message.startsWith("Mercado Pago 404")) return NextResponse.json({ ok: true, ignorado: "pago inexistente" });
    console.error("webhook:", e);
    // 500 = Mercado Pago reintenta el aviso más tarde.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
