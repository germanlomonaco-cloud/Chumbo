import crypto from "node:crypto";
import { env } from "./env";

const API = "https://api.mercadopago.com";

async function mp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${env.mpAccessToken()}`, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body as T;
}

// Seguridad: mientras no digas lo contrario, sólo se aceptan credenciales de PRUEBA.
// Las credenciales de prueba empiezan con "TEST-"; las de una cuenta de prueba (vendedora)
// empiezan con "APP_USR-" pero esa cuenta tiene la etiqueta "test_user" en Mercado Pago.
let verificado: boolean | null = null;
export async function asegurarModoPrueba() {
  if (env.permitirProduccion()) return;
  if (verificado) return;
  const token = env.mpAccessToken();
  if (token.startsWith("TEST-")) { verificado = true; return; }
  const yo = await mp<{ tags?: string[] }>("/users/me");
  if (!yo.tags?.includes("test_user")) {
    throw new Error("La credencial de Mercado Pago no es de prueba. Usá las credenciales de prueba (o de tu cuenta vendedora de prueba).");
  }
  verificado = true;
}

type Preferencia = { id: string; init_point: string; sandbox_init_point?: string };

export async function crearPreferencia(p: {
  propinaId: string; usuario: string; nombre: string; monto: number;
}) {
  const site = env.siteUrl();
  const vuelta = `${site}/${p.usuario}/gracias?propina=${p.propinaId}`;
  return mp<Preferencia>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": p.propinaId },
    body: JSON.stringify({
      items: [{ id: "propina", title: `Propina para ${p.nombre}`, quantity: 1, unit_price: p.monto, currency_id: "ARS" }],
      external_reference: p.propinaId,
      back_urls: { success: vuelta, pending: vuelta, failure: vuelta },
      auto_return: "approved",
      notification_url: `${site}/api/webhooks/mercadopago`,
      statement_descriptor: "CHUMBO",
    }),
  });
}

export type Pago = {
  id: number; status: string; status_detail: string;
  external_reference: string | null; transaction_amount: number; currency_id: string;
};
export const obtenerPago = (id: string) => mp<Pago>(`/v1/payments/${encodeURIComponent(id)}`);

// Verifica que el aviso (webhook) venga realmente de Mercado Pago, usando la "clave secreta" del webhook.
// Mercado Pago firma cada aviso: header x-signature = "ts=...,v1=<hmac>".
export function firmaValida(opts: { xSignature: string | null; xRequestId: string | null; dataId: string | null }) {
  const { xSignature, xRequestId, dataId } = opts;
  if (!xSignature) return false;
  const partes = Object.fromEntries(xSignature.split(",").map(p => p.trim().split("=", 2) as [string, string]));
  const ts = partes["ts"], v1 = partes["v1"];
  if (!ts || !v1) return false;
  let manifiesto = "";
  if (dataId) manifiesto += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (xRequestId) manifiesto += `request-id:${xRequestId};`;
  manifiesto += `ts:${ts};`;
  const esperado = crypto.createHmac("sha256", env.mpWebhookSecret()).update(manifiesto).digest("hex");
  const a = Buffer.from(esperado), b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
