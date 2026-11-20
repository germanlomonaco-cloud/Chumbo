"use client";

import { useState } from "react";
import { MONTOS, MENSAJE_MAX, formatoPesos, semillasPara } from "@/lib/reglas";
import Semilla from "./Semilla";

export default function FormularioPropina({ usuario, nombre }: { usuario: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState<number>(MONTOS[1]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    setCargando(true); setError(null);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, monto, mensaje }),
      });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "No pudimos iniciar el pago.");
      window.location.href = d.url;   // vamos al checkout de Mercado Pago
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar el pago.");
      setCargando(false);
    }
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)}
        className="w-full rounded-2xl bg-menta py-5 text-xl font-bold text-black active:scale-[.98] transition">
        Dejar propina
      </button>
    );
  }

  return (
    <div className="w-full space-y-5">
      <p className="text-center text-suave">¿Cuánto le querés dejar a {nombre}?</p>
      <div className="grid grid-cols-3 gap-3">
        {MONTOS.map(m => (
          <button key={m} onClick={() => setMonto(m)} aria-pressed={monto === m}
            className={`rounded-2xl border-2 py-5 text-lg font-bold active:scale-95 ${monto === m ? "border-menta bg-menta text-black" : "border-borde bg-panel text-texto"}`}>
            {formatoPesos(m)}
          </button>
        ))}
      </div>
      <p className="flex items-center justify-center gap-2 text-sm text-menta">
        <Semilla className="h-5 w-5" /> Suma {semillasPara(monto)} semillas
      </p>
      <label className="block">
        <span className="mb-2 block text-sm text-suave">Mensaje (opcional)</span>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value.slice(0, MENSAJE_MAX))} rows={3}
          placeholder="¡Gracias por la buena onda!"
          className="w-full resize-none rounded-2xl border-2 border-borde bg-panel p-4 text-base text-texto placeholder:text-suave/60 focus:border-menta focus:outline-none" />
        <span className="mt-1 block text-right text-xs text-suave">{mensaje.length}/{MENSAJE_MAX}</span>
      </label>
      {error && <p className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
      <button onClick={pagar} disabled={cargando}
        className="w-full rounded-2xl bg-menta py-5 text-xl font-bold text-black transition active:scale-[.98] disabled:opacity-60">
        {cargando ? "Abriendo Mercado Pago…" : `Pagar ${formatoPesos(monto)}`}
      </button>
      <p className="text-center text-xs text-suave">Pagás de forma segura en Mercado Pago. Chumbo nunca ve los datos de tu tarjeta.</p>
    </div>
  );
}
