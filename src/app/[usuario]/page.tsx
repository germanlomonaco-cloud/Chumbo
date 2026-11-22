import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buscarPerfil } from "@/lib/perfiles";
import FormularioPropina from "@/components/FormularioPropina";
import AvatarPerfil from "@/components/AvatarPerfil";
import Marca from "@/components/Marca";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ usuario: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await buscarPerfil((await params).usuario);
  return { title: p ? `Dejale una propina a ${p.nombre} · Chumbo` : "Chumbo" };
}

export default async function PaginaPerfil({ params }: Props) {
  const perfil = await buscarPerfil((await params).usuario);
  if (!perfil) notFound();

  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center"><Marca /></header>
        <section className="mt-8 flex flex-1 flex-col items-center">
          <div className="rounded-full shadow-[0_0_40px_rgba(110,230,160,.25)]">
            <AvatarPerfil perfil={perfil} />
          </div>
          <h1 className="mt-5 text-[28px] font-bold tracking-tight">{perfil.nombre}</h1>
          <p className="mt-1 rounded-full border border-borde bg-panel px-3 py-1 text-sm text-suave">{perfil.rol}</p>
          <div className="mt-10 w-full">
            <FormularioPropina usuario={perfil.usuario} nombre={perfil.nombre} />
          </div>
        </section>
      </div>
    </main>
  );
}
