# Chumbo 🌱

Propinas y regalos con un QR por persona. Cada propina suma **semillas**.

## Qué hay hecho (meta 1)

- `/german`: perfil de prueba con foto, nombre y botón **Dejar propina**.
- Montos rápidos de $1.000, $2.000 y $5.000, más un mensaje opcional (140 caracteres).
- **Pagar**: crea la propina como *pendiente* en Supabase y el cobro en Mercado Pago (Checkout Pro, modo prueba).
- `/german/gracias`: pantalla de vuelta. **No** da el pago por bueno: espera el aviso de Mercado Pago.
- `/api/webhooks/mercadopago`: único lugar donde una propina pasa a *aprobada*. Verifica la firma del aviso, consulta el pago real en Mercado Pago y controla monto y moneda.
- Semillas: 1 cada $100 (se cambia en `src/lib/reglas.ts`).

## Seguridad

- Las claves van **sólo** en `.env.local` (tu compu) o en Vercel → Settings → Environment Variables. `.env.local` nunca se sube a GitHub (`.gitignore`).
- `.env.example` es la plantilla con los nombres de las variables, sin valores.
- La app se niega a cobrar con credenciales que no sean de prueba mientras `MP_PERMITIR_PRODUCCION` no sea `true`.
- Los datos de tarjeta nunca pasan por Chumbo: se cargan en Mercado Pago.
- La tabla `propinas` tiene RLS activado y sin políticas: sólo el servidor puede leerla o escribirla.

## Puesta en marcha

1. **Supabase**: SQL Editor → pegar `supabase/schema.sql` → Run.
2. **Vercel**: importar el repositorio y cargar las variables de `.env.example`.
3. **Mercado Pago**: en la aplicación Chumbo → Webhooks → URL de prueba `https://TU-APP.vercel.app/api/webhooks/mercadopago`, evento **Pagos**. Copiar la clave secreta en `MP_WEBHOOK_SECRET`.
4. Probar un pago con la cuenta compradora de prueba.
