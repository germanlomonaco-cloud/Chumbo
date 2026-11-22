import type { Metadata } from "next";
import Marca from "@/components/Marca";
import MiLink from "@/components/MiLink";

export const metadata: Metadata = { title: "Mi link · Chumbo", robots: { index: false } };

export default function PaginaMiLink() {
  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex justify-center"><Marca /></header>
        <MiLink />
      </div>
    </main>
  );
}
