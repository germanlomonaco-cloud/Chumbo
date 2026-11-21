import type { Metadata } from "next";
import Semilla from "@/components/Semilla";
import Marca from "@/components/Marca";
import FormularioLista from "@/components/FormularioLista";

export const metadata: Metadata = {
  title: "Chumbo llega pronto",
  description: "Regalá un café, un combo o una sorpresa en un toque. Anotate y te avisamos cuando salga.",
};

type Props = { searchParams: Promise<{ desde?: string }> };

// Lista de espera (para el link de Instagram: chumbo.app/pronto?desde=instagram)
export default async function Pronto({ searchParams }: Props) {
  const { desde } = await searchParams;
  return (
    <main className="brillo min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 pb-10 pt-10 text-center">
        <Semilla size={96} halo className="latido" />
        <h1 className="mt-14 text-[38px] font-bold leading-[1.05] tracking-tight">Que tu saludo no quede en un mensaje.</h1>
        <p className="mt-4 text-lg text-suave">Regalá un café, un combo o una sorpresa en un toque. Sin bajar ninguna app.</p>
        <div className="mt-3 rounded-full border border-menta bg-menta-suave px-4 py-1.5 text-sm font-bold text-menta">Llega pronto</div>
        <div className="mt-10 w-full"><FormularioLista origen={desde} /></div>
        <div className="mt-auto pt-12"><Marca className="text-3xl" /></div>
      </div>
    </main>
  );
}
