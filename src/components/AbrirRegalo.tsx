"use client";

import { useState } from "react";
import Link from "next/link";

// Lo que ve quien recibe el Chumbo: la cajita cerrada → se abre → el regalo y su código.
// (Versión simple; los pasos 4 a 6 completos, con QR y papelitos, vienen en la próxima meta.)
export default function AbrirRegalo(p: {
  de: string; producto: string; emoji: string; mensaje: string | null; codigo: string; vence: string | null; sorpresa: boolean;
}) {
  const [abierto, setAbierto] = useState(!p.sorpresa);
  const vence = p.vence ? new Date(p.vence).toLocaleDateString("es-AR", { day: "numeric", month: "long" }) : null;

  if (!abierto) return (
    <div className="flex flex-col items-center text-center">
      <button onClick={() => setAbierto(true)} aria-label="Abrir el regalo" className="relative grid h-56 w-56 place-items-center">
        <div className="halo" style={{ width: 340, height: 340 }} />
        <span className="latido text-[120px] leading-none">🎁</span>
      </button>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{p.de} te mandó un Chumbo</h1>
      <p className="mt-2 text-suave">Hay una sorpresa para vos</p>
      <button onClick={() => setAbierto(true)} className="mt-8 rounded-full border border-menta px-6 py-3 font-bold text-menta">Tocá para abrir</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid h-28 w-28 place-items-center rounded-3xl bg-papel text-6xl shadow-[0_0_40px_rgba(127,224,168,.35)]">{p.emoji}</div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">¡{p.producto} para vos!</h1>
      {p.mensaje && (
        <blockquote className="mt-6 w-full rounded-2xl border border-borde bg-panel p-4 text-left">
          <p>&ldquo;{p.mensaje}&rdquo;</p>
          <footer className="mt-2 text-sm text-suave">— {p.de}</footer>
        </blockquote>
      )}
      <div className="mt-6 w-full rounded-3xl bg-papel p-5 text-tinta">
        <p className="text-xs font-bold uppercase tracking-[.1em] text-black/50">Mostrá este código en la caja</p>
        <p className="mt-2 font-mono text-3xl font-bold tracking-[.15em]">{p.codigo}</p>
        <p className="mt-1 text-sm text-black/55">Cualquier estación adherida{vence ? ` · vence el ${vence}` : ""}</p>
      </div>
      <Link href="/" className="mt-6 w-full rounded-full border border-borde py-4 font-bold">Creá tu Chumbo y recibí regalos</Link>
    </div>
  );
}
