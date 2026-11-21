import type { Metadata } from "next";
import PanelCanje from "@/components/PanelCanje";

export const metadata: Metadata = { title: "Panel del comercio · Chumbo", robots: { index: false } };

// Panel para canjear los regalos en la caja (chumbo.app/comercio)
export default function Comercio() {
  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
        <PanelCanje />
      </div>
    </main>
  );
}
