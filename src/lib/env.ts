// Lee las claves desde las variables de entorno (.env.local en tu compu, o el panel de Vercel).
// Sólo se usa en el servidor (rutas /api y páginas del servidor): nunca llega al navegador,
// porque ninguna de estas variables empieza con NEXT_PUBLIC_ (salvo la dirección del sitio, que es pública).
function requerida(nombre: string): string {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable de entorno ${nombre}. Revisá .env.example.`);
  return v;
}

export const env = {
  mpAccessToken: () => requerida("MP_ACCESS_TOKEN"),
  mpWebhookSecret: () => requerida("MP_WEBHOOK_SECRET"),
  permitirProduccion: () => process.env.MP_PERMITIR_PRODUCCION === "true",
  supabaseUrl: () => requerida("SUPABASE_URL").replace(/\/+$/, ""),
  supabaseServiceKey: () => requerida("SUPABASE_SERVICE_ROLE_KEY"),
  siteUrl: () => requerida("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, ""),
};
