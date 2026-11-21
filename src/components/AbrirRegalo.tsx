"use client";

import { useState } from "react";
import Link from "next/link";

// Lo que ve quien recibe el Chumbo (pasos 4 a 6 del diseño):
// la cajita cerrada que late → se abre con papelitos → el regalo, el mensaje y el QR para canjear.
const COLORES = ["#7fe0a8", "#f4f4f1", "#f59fb0", "#b9a6f5", "#f2b46b"];

function Papelitos() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="papelito" style={{
          left: `${(i * 37) % 100}%`, background: COLORES[i % COLORES.length],
          animationDelay: `${(i % 7) * 0.06}s`, animationDuration: `${1.6 + (i % 5) * 0.25}s`,
          transform: `rotate(${i * 47}deg)`,
        }} />
      ))}
    </div>
  );
}

export default function AbrirRegalo(p: {
  de: string; producto: string; emoji: string; mensaje: string | null; codigo: string; vence: string | null; sorpresa: boolean; qrSvg: string;
}) {
  const [abierto, setAbierto] = useState(!p.sorpresa);
  const [festejo, setFestejo] = useState(false);
  const vence = p.vence ? new Date(p.vence).toLocaleDateString("es-AR", { day: "numeric", month: "long" }) : null;

  function abrir() {
    setAbierto(true); setFestejo(true);
    try { navigator.vibrate?.([60, 40, 90]); } catch {}
  }

  if (!abierto) return (
    <div className="flex flex-col items-center text-center">
      <button onClick={abrir} aria-label="Abrir el regalo" className="relative grid h-56 w-56 place-items-center">
        <div className="halo" style={{ width: 340, height: 340 }} />
        <span className="latido text-[120px] leading-none">🎁</span>
      </button>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{p.de} te mandó un Chumbo</h1>
      <p className="mt-2 text-suave">Hay una sorpresa para vos</p>
      <button onClick={abrir} className="mt-8 rounded-full border border-menta px-6 py-3 font-bold text-menta">Tocá para abrir</button>
    </div>
  );

  const gracias = `¡Gracias por el Chumbo, ${p.de}! 💚`;
  return (
    <div className="relative flex flex-col items-center text-center">
      {festejo && <Papelitos />}
      <div className="aparecer grid h-24 w-24 place-items-center rounded-3xl bg-papel text-5xl shadow-[0_0_40px_rgba(127,224,168,.35)]">{p.emoji}</div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">¡{p.producto} para vos!</h1>
      {p.mensaje && (
        <blockquote className="mt-5 w-full rounded-2xl border border-borde bg-panel p-4 text-left">
          <p>&ldquo;{p.mensaje}&rdquo;</p>
          <footer className="mt-2 text-sm text-suave">— {p.de}</footer>
        </blockquote>
      )}
      <div className="mt-5 w-full rounded-3xl bg-papel p-5 text-tinta">
        <p className="text-xs font-bold uppercase tracking-[.1em] text-black/50">Mostrá este QR en la caja</p>
        <div className="mx-auto mt-3 w-48 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: p.qrSvg }} />
        <p className="mt-3 font-mono text-2xl font-bold tracking-[.15em]">{p.codigo}</p>
        <p className="mt-1 text-sm text-black/55">Cualquier estación adherida{vence ? ` · vence el ${vence}` : ""}</p>
      </div>
      <a href={`https://wa.me/?text=${encodeURIComponent(gracias)}`} target="_blank" rel="noopener"
        className="mt-5 w-full rounded-full bg-menta py-4 font-bold text-menta-hondo">💚 Mandarle un gracias a {p.de}</a>
      <Link href="/" className="mt-3 w-full rounded-full border border-borde py-4 font-bold">Creá tu Chumbo y recibí regalos</Link>
    </div>
  );
}
