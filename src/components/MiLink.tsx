"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Semilla from "./Semilla";

const CLAVE_MI_PERFIL = "chumbo-mi-perfil";

// "Mi link": si ya creaste tu perfil en este celu, te lleva a tu QR. Si no, te invita a crearlo.
export default function MiLink() {
  const [mio, setMio] = useState<{ usuario: string; nombre: string } | null | undefined>(undefined);

  useEffect(() => {
    try { setMio(JSON.parse(localStorage.getItem(CLAVE_MI_PERFIL) || "null")); } catch { setMio(null); }
  }, []);

  if (mio === undefined) return null;

  if (mio) {
    return (
      <section className="flex flex-1 flex-col justify-center text-center">
        <p className="text-suave">Hola, {mio.nombre}</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight">Tu link de propinas</h1>
        <p className="mt-3 font-mono text-lg text-menta">/{mio.usuario}</p>
        <Link href={`/${mio.usuario}/qr`} className="mt-10 block rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Ver mi QR</Link>
        <Link href={`/${mio.usuario}`} className="mt-3 block rounded-full border border-borde bg-panel py-4 font-bold">Ver mi perfil</Link>
        <Link href="/" className="mt-8 text-sm text-suave underline">Volver al inicio</Link>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      <Semilla size={80} halo className="latido" />
      <h1 className="mt-10 text-[28px] font-bold leading-tight tracking-tight">Recibí propinas con tu propio QR</h1>
      <p className="mt-3 text-suave">Para mozos, baristas, delivery, músicos y creadores. Te lleva un minuto.</p>
      <Link href="/crear" className="mt-10 block w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Crear mi link</Link>
      <Link href="/" className="mt-8 text-sm text-suave underline">Volver al inicio</Link>
    </section>
  );
}
