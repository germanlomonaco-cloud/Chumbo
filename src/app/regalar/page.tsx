import type { Metadata } from "next";
import FlujoRegalo from "@/components/FlujoRegalo";

export const metadata: Metadata = { title: "Regalar · Chumbo" };

type Props = { searchParams: Promise<{ producto?: string }> };

export default async function Regalar({ searchParams }: Props) {
  const { producto } = await searchParams;
  return (
    <main className="brillo min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-6 pt-4">
        <FlujoRegalo productoInicial={producto} />
      </div>
    </main>
  );
}
