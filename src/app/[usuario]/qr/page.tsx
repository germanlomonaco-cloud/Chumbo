import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import type { Metadata } from "next";
import { buscarPerfil } from "@/lib/perfiles";
import { env } from "@/lib/env";
import AvatarPerfil from "@/components/AvatarPerfil";
import AccionesQR from "@/components/AccionesQR";
import Marca from "@/components/Marca";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tu QR · Chumbo", robots: { index: false } };

type Props = { params: Promise<{ usuario: string }> };

// El QR de cada persona: para mostrar en el celu, imprimir y pegar en la caja o la mesa.
export default async function QRPerfil({ params }: Props) {
  const perfil = await buscarPerfil((await params).usuario);
  if (!perfil) notFound();
  const link = `${env.siteUrl()}/${perfil.usuario}`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121513", light: "#ffffff" } });
  const corto = link.replace(/^https?:\/\//, "");

  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)] print:bg-white">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center print:hidden"><Marca /></header>

        {/* Tarjeta (es lo único que sale al imprimir) */}
        <section className="mt-8 rounded-[28px] bg-white p-6 text-center text-tinta shadow-[0_0_60px_rgba(110,230,160,.18)] print:mt-0 print:shadow-none">
          <div className="flex items-center justify-center gap-3">
            <AvatarPerfil perfil={perfil} size={52} />
            <div className="text-left">
              <p className="text-xl font-bold leading-tight">{perfil.nombre}</p>
              <p className="text-sm text-black/55">{perfil.rol}</p>
            </div>
          </div>
          <div className="mx-auto mt-5 w-full max-w-[280px] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="mt-4 text-lg font-bold">Escaneá y dejame una propina 💚</p>
          <p className="mt-1 font-mono text-sm text-black/55">{corto}</p>
          <p className="mt-4 text-sm font-extrabold tracking-tight">chumbo<span className="text-[#2fae6a]">.</span></p>
        </section>

        <div className="print:hidden">
          <AccionesQR link={link} usuario={perfil.usuario} nombre={perfil.nombre} />
          <Link href="/mis-chumbos" className="mt-3 block rounded-full border border-borde bg-panel py-4 text-center font-bold">Ir a Mis Chumbos</Link>
          <Link href={`/${perfil.usuario}`} className="mt-6 block text-center text-sm text-suave underline">Ver mi perfil como lo ven los demás</Link>
        </div>
      </div>
    </main>
  );
}
