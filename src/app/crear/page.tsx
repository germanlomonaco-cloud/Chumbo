import type { Metadata } from "next";
import Marca from "@/components/Marca";
import CrearPerfil from "@/components/CrearPerfil";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Creá tu link · Chumbo" };
export const dynamic = "force-dynamic";

export default function Crear() {
  const dominio = env.siteUrl().replace(/^https?:\/\//, "");
  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center"><Marca /></header>
        <CrearPerfil dominio={dominio} />
      </div>
    </main>
  );
}
