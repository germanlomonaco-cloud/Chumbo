"use client";

import { useState } from "react";
import { MONTOS, MENSAJE_MAX, formatoPesos, semillasPara } from "@/lib/reglas";
import Semilla from "./Semilla";

const MENSAJES_LISTOS = ["¡Gracias por la buena onda! 💚", "Excelente atención 🙌", "Para un cafecito ☕"];

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
        className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98]">
        Dejar propina
      </button>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[.08em] text-suave">Elegí el monto</p>
        <div className="grid grid-cols-3 gap-3">
          {MONTOS.map(m => (
            <button key={m} onClick={() => setMonto(m)} aria-pressed={monto === m}
              className={`rounded-2xl border py-5 text-lg font-bold active:scale-95 ${monto === m
                ? "border-menta bg-menta text-menta-hondo shadow-[0_0_24px_rgba(127,224,168,.35)]"
                : "border-borde bg-panel text-texto"}`}>
              {formatoPesos(m)}
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-menta">
          <Semilla size={14} /> Suma {semillasPara(monto)} semillas
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[.08em] text-suave">Dejale un mensaje (opcional)</p>
        <div className="space-y-2">
          {MENSAJES_LISTOS.map(t => (
            <button key={t} onClick={() => setMensaje(mensaje === t ? "" : t)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-[15px] ${mensaje === t ? "border-menta bg-menta-suave" : "border-borde bg-panel"}`}>
              {mensaje === t && <span className="mr-1 text-menta">✓</span>}{t}
            </button>
          ))}
        </div>
        <textarea value={MENSAJES_LISTOS.includes(mensaje) ? "" : mensaje}
          onChange={e => setMensaje(e.target.value.slice(0, MENSAJE_MAX))} rows={2}
          placeholder="✨ O escribilo con tus palabras"
          className="mt-2 w-full resize-none rounded-2xl border border-borde bg-panel p-4 text-[15px] text-texto placeholder:text-menta/80 focus:border-menta focus:outline-none" />
      </div>

      <div className="rounded-2xl border border-borde bg-panel p-4">
        <div className="flex justify-between text-suave"><span>Propina para {nombre}</span><span>{formatoPesos(monto)}</span></div>
        <div className="mt-2 flex justify-between text-suave"><span>Costo de servicio</span><span>$0</span></div>
        <div className="mt-3 flex justify-between border-t border-borde pt-3 text-lg font-bold"><span>Total</span><span>{formatoPesos(monto)}</span></div>
      </div>

      {error && <p className="rounded-2xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
      <div>
        <button onClick={pagar} disabled={cargando}
          className="w-full rounded-full bg-papel py-5 text-lg font-bold text-tinta transition active:scale-[.98] disabled:opacity-60">
          {cargando ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
        </button>
        <p className="mt-3 text-center text-xs text-suave">No necesitás cuenta en Chumbo. Chumbo nunca ve los datos de tu tarjeta.</p>
      </div>
    </div>
  );
}
