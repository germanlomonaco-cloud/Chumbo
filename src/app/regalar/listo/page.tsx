import Link from "next/link";
import { leerRegalo } from "@/lib/supabase";
import EstadoRegalo from "@/components/EstadoRegalo";
import Marca from "@/components/Marca";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ regalo?: string }> };

// Vuelta del checkout de un regalo. Muestra el estado guardado en nuestra base (sólo cambia con el aviso de Mercado Pago).
export default async function RegaloListo({ searchParams }: Props) {
  const id = (await searchParams).regalo || "";
  const r = await leerRegalo(id).catch(() => null);
  return (
    <main className="brillo min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center"><Marca /></header>
        <section className="flex flex-1 flex-col justify-center">
          {r ? (
            <EstadoRegalo id={r.id} para={r.para_nombre} de={r.de_nombre} inicial={r.estado}
              codigo={r.estado === "aprobado" ? r.codigo : null} />
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold">No encontramos este regalo</h1>
              <Link href="/regalar" className="mt-10 block rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Hacer un regalo</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
