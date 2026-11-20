import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { buscarPerfil } from "@/lib/perfiles";
import FormularioPropina from "@/components/FormularioPropina";
import Marca from "@/components/Marca";

type Props = { params: Promise<{ usuario: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = buscarPerfil((await params).usuario);
  return { title: p ? `Dejale una propina a ${p.nombre} · Chumbo` : "Chumbo" };
}

export default async function PaginaPerfil({ params }: Props) {
  const perfil = buscarPerfil((await params).usuario);
  if (!perfil) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
      <Marca />
      <section className="mt-10 flex flex-1 flex-col items-center">
        <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-menta">
          <Image src={perfil.foto} alt={`Foto de ${perfil.nombre}`} fill className="object-cover" priority unoptimized />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">{perfil.nombre}</h1>
        <p className="mt-1 text-suave">{perfil.rol}</p>
        <div className="mt-10 w-full">
          <FormularioPropina usuario={perfil.usuario} nombre={perfil.nombre} />
        </div>
      </section>
    </main>
  );
}
