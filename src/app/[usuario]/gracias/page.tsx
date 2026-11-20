import { notFound } from "next/navigation";
import Link from "next/link";
import { buscarPerfil } from "@/lib/perfiles";
import { leerPropina } from "@/lib/supabase";
import EstadoPago from "@/components/EstadoPago";
import Marca from "@/components/Marca";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ usuario: string }>; searchParams: Promise<{ propina?: string }> };

// Pantalla de vuelta del checkout. Ignora lo que diga la dirección (status=approved, etc.):
// muestra el estado guardado en nuestra base, que sólo cambia con el aviso de Mercado Pago.
export default async function Gracias({ params, searchParams }: Props) {
  const perfil = buscarPerfil((await params).usuario);
  if (!perfil) notFound();
  const id = (await searchParams).propina || "";
  const propina = await leerPropina(id).catch(() => null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
      <Marca />
      <section className="flex flex-1 flex-col justify-center">
        {propina && propina.usuario === perfil.usuario ? (
          <EstadoPago id={propina.id} usuario={perfil.usuario} nombre={perfil.nombre}
            inicial={propina.estado} monto={propina.monto} semillas={propina.semillas} />
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">No encontramos esta propina</h1>
            <Link href={`/${perfil.usuario}`} className="mt-8 block rounded-2xl bg-menta py-5 text-xl font-bold text-black">Volver al perfil</Link>
          </div>
        )}
      </section>
    </main>
  );
}
