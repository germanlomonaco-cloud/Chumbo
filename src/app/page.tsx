import Link from "next/link";
import Semilla from "@/components/Semilla";
import Marca from "@/components/Marca";

// Portada provisoria con el estilo de la placa de apertura.
export default function Inicio() {
  return (
    <main className="brillo min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 pb-10 text-center">
        <div className="flex flex-1 flex-col items-center justify-center pt-16">
          <Semilla size={96} halo className="latido" />
          <h1 className="mt-12 text-[38px] font-bold leading-[1.05] tracking-tight">Que tu propina no quede en un gracias.</h1>
          <p className="mt-4 text-lg text-suave">Dejá algo de verdad, en un toque. Cada propina suma semillas.</p>
          <Link href="/german" className="mt-10 w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Ver perfil de prueba</Link>
        </div>
        <Marca className="text-3xl" />
      </div>
    </main>
  );
}
