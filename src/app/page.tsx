import Link from "next/link";
import Semilla from "@/components/Semilla";

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
      <Semilla className="h-24 w-24" />
      <h1 className="mt-6 text-5xl font-extrabold tracking-tight">chumbo</h1>
      <p className="mt-4 text-lg text-suave">Dejá propinas y regalos con un QR. Cada propina suma semillas.</p>
      <Link href="/german" className="mt-10 w-full rounded-2xl bg-menta py-5 text-xl font-bold text-black">Ver perfil de prueba</Link>
    </main>
  );
}
