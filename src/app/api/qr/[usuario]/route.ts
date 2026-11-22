import QRCode from "qrcode";
import { buscarPerfil } from "@/lib/perfiles";
import { env } from "@/lib/env";

// Imagen PNG del QR de un perfil (para guardar en el celu, mandar por WhatsApp o imprimir en grande).
export async function GET(_req: Request, { params }: { params: Promise<{ usuario: string }> }) {
  const perfil = await buscarPerfil((await params).usuario);
  if (!perfil) return new Response("No existe", { status: 404 });
  const png = await QRCode.toBuffer(`${env.siteUrl()}/${perfil.usuario}`, {
    type: "png", width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#121513", light: "#ffffff" },
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="chumbo-${perfil.usuario}.png"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
