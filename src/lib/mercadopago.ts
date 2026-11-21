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

// Crea un cobro de Checkout Pro. "referencia" vuelve en el pago y nos dice qué se pagó
// (el id de una propina, o "regalo:<id>" para un regalo).
export async function crearCobro(p: { referencia: string; idItem: string; titulo: string; monto: number; vuelta: string }) {
  const site = env.siteUrl();
  return mp<Preferencia>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": p.referencia },
    body: JSON.stringify({
      items: [{ id: p.idItem, title: p.titulo, quantity: 1, unit_price: p.monto, currency_id: "ARS" }],
      external_reference: p.referencia,
      back_urls: { success: p.vuelta, pending: p.vuelta, failure: p.vuelta },
      auto_return: "approved",
      notification_url: `${site}/api/webhooks/mercadopago`,
      statement_descriptor: "CHUMBO",
    }),
  });
}

export function crearPreferencia(p: { propinaId: string; usuario: string; nombre: string; monto: number }) {
  return crearCobro({
    referencia: p.propinaId, idItem: "propina", titulo: `Propina para ${p.nombre}`, monto: p.monto,
    vuelta: `${env.siteUrl()}/${p.usuario}/gracias?propina=${p.propinaId}`,
  });
}

// Con credenciales "TEST-" Mercado Pago usa el checkout de pruebas (sandbox).
export const urlCheckout = (pref: Preferencia) =>
  env.mpAccessToken().startsWith("TEST-") && pref.sandbox_init_point ? pref.sandbox_init_point : pref.init_point;

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
