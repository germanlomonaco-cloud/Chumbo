import Link from "next/link";
import type { Metadata } from "next";
import { leerRegaloPorCodigo } from "@/lib/supabase";
import { buscarProducto } from "@/lib/catalogo";
import AbrirRegalo from "@/components/AbrirRegalo";
import Marca from "@/components/Marca";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Te mandaron un Chumbo 🎁", robots: { index: false } };

type Props = { params: Promise<{ codigo: string }> };

// Link que recibe el amigo (chumbo.app/r/CHB-XXXXXX). Sólo muestra regalos con el pago aprobado.
export default async function RecibirRegalo({ params }: Props) {
  const codigo = decodeURIComponent((await params).codigo).toUpperCase();
  const r = await leerRegaloPorCodigo(codigo).catch(() => null);
  const ok = r && r.estado === "aprobado";
  return (
    <main className="brillo min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center"><Marca /></header>
        <section className="flex flex-1 flex-col justify-center">
          {ok ? (
            <AbrirRegalo de={r.de_nombre} producto={r.producto_nombre} emoji={buscarProducto(r.producto_id)?.emoji || "🎁"}
              mensaje={r.mensaje} codigo={r.codigo} vence={r.vence} sorpresa={r.sorpresa} />
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold">Este Chumbo no está disponible</h1>
              <p className="mt-3 text-suave">Puede que el link esté mal escrito o que el pago todavía no se haya confirmado.</p>
              <Link href="/" className="mt-10 block rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Ir a Chumbo</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
