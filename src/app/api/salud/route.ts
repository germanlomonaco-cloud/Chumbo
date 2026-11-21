import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Diagnóstico de configuración. NUNCA devuelve claves: sólo qué tipo de clave hay y si cada servicio responde.
function tipoClaveSupabase(k?: string) {
  if (!k) return "falta";
  if (k.startsWith("sb_secret_")) return "secret (correcta)";
  if (k.startsWith("sb_publishable_")) return "publishable (INCORRECTA: usá la secret o la service_role)";
  try {
    const rol = JSON.parse(Buffer.from(k.split(".")[1], "base64url").toString()).role;
    if (rol === "service_role") return "service_role (correcta)";
    if (rol === "anon") return "anon (INCORRECTA: usá la service_role)";
    return `rol desconocido: ${rol}`;
  } catch { return "formato desconocido"; }
}

export async function GET() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const mp = process.env.MP_ACCESS_TOKEN;

  let supabaseLectura = "sin probar";
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/propinas?select=id&limit=1`, {
        headers: { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }) }, cache: "no-store",
      });
      const b = await r.json().catch(() => ({}));
      supabaseLectura = r.ok ? "ok" : `HTTP ${r.status}${b?.code ? " · " + b.code : ""}${b?.message ? " · " + String(b.message).slice(0, 80) : ""}`;
    } catch { supabaseLectura = "no responde (revisá SUPABASE_URL)"; }
  }

  return NextResponse.json({
    supabase_url: url ? (url.endsWith(".supabase.co") ? "ok" : "no termina en .supabase.co") : "falta",
    supabase_clave: tipoClaveSupabase(key),
    supabase_tabla_propinas: supabaseLectura,
    mp_access_token: !mp ? "falta" : mp.startsWith("TEST-") ? "de prueba (TEST-)" : mp.startsWith("APP_USR-") ? "APP_USR- (se verifica que sea de cuenta de prueba)" : "formato desconocido",
    mp_webhook_secret: process.env.MP_WEBHOOK_SECRET ? "cargada (se verifica la firma)" : "no cargada (opcional: con IPN funciona igual)",
    sitio: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "falta"),
  });
}
