"use client";

import { useState } from "react";
import Link from "next/link";
import { CATALOGO, OCASIONES, MENSAJES, MENSAJE_REGALO_MAX, NOMBRE_MAX, DIAS_VENCIMIENTO, type Ocasion } from "@/lib/catalogo";
import { formatoPesos } from "@/lib/reglas";

const etiqueta = "mb-3 text-xs font-bold uppercase tracking-[.08em] text-suave";
const campo = "w-full rounded-2xl border border-borde bg-panel px-4 py-4 text-[16px] text-texto placeholder:text-suave/70 focus:border-menta focus:outline-none";

export default function FlujoRegalo({ productoInicial }: { productoInicial?: string }) {
  const [paso, setPaso] = useState(1);
  const [para, setPara] = useState("");
  const [ocasion, setOcasion] = useState<Ocasion>("cumple");
  const [producto, setProducto] = useState(CATALOGO.some(p => p.id === productoInicial) ? productoInicial! : "cafe");
  const [de, setDe] = useState("");
  const [mensaje, setMensaje] = useState(MENSAJES.cumple[0]);
  const [editando, setEditando] = useState(false);
  const [sorpresa, setSorpresa] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prod = CATALOGO.find(p => p.id === producto)!;
  const nombrePara = para.trim() || "tu amigo";

  function cambiarOcasion(o: Ocasion) {
    setOcasion(o);
    if (!editando) setMensaje(MENSAJES[o][0]);   // si no lo editó a mano, sugerimos uno de la ocasión
  }

  async function pagar() {
    setCargando(true); setError(null);
    try {
      const r = await fetch("/api/regalos/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ para, de, ocasion, producto, mensaje, sorpresa }),
      });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "No pudimos iniciar el pago.");
      window.location.href = d.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar el pago.");
      setCargando(false);
    }
  }

  const puedeSeguir1 = para.trim().length > 0;
  const puedeSeguir2 = de.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Encabezado: volver + "1 DE 3" */}
      <div className="flex items-center justify-between">
        {paso === 1
          ? <Link href="/" aria-label="Volver" className="grid h-10 w-10 place-items-center text-2xl">←</Link>
          : <button onClick={() => setPaso(paso - 1)} aria-label="Volver" className="grid h-10 w-10 place-items-center text-2xl">←</button>}
        <span className="text-xs font-bold tracking-[.12em] text-suave">{paso} DE 3</span>
        <span className="h-10 w-10" />
      </div>

      {paso === 1 && (
        <div className="mt-4 flex-1 space-y-7">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">¿Para quién y qué le regalás?</h1>
          <div>
            <p className={etiqueta}>Para</p>
            <input value={para} onChange={e => setPara(e.target.value.slice(0, NOMBRE_MAX))} placeholder="Nombre de tu amigo o amiga" className={campo} autoFocus />
          </div>
          <div className="flex flex-wrap gap-2">
            {OCASIONES.map(o => (
              <button key={o.id} onClick={() => cambiarOcasion(o.id)}
                className={`rounded-full border px-4 py-2 text-[15px] font-medium ${o.id === ocasion ? "border-menta bg-menta text-menta-hondo" : "border-borde bg-panel"}`}>
                {o.etiqueta}
              </button>
            ))}
          </div>
          <div>
            <p className={etiqueta}>Elegí el regalo</p>
            <div className="space-y-3">
              {CATALOGO.map(p => (
                <button key={p.id} onClick={() => setProducto(p.id)} aria-pressed={p.id === producto}
                  className={`flex w-full items-center gap-3 rounded-2xl bg-papel p-3 text-left text-tinta ${p.id === producto ? "outline-3 outline-offset-2 outline-menta shadow-[0_0_24px_rgba(127,224,168,.35)]" : ""}`}>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-black/5 text-2xl">{p.emoji}</span>
                  <span className="flex-1"><b className="block">{p.nombre}</b><span className="text-sm text-black/55">{p.detalle}</span></span>
                  <b>{formatoPesos(p.precio)}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="mt-4 flex-1 space-y-7">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">Escribile algo a {nombrePara}</h1>
          <div>
            <p className={etiqueta}>Elegí un mensaje</p>
            <div className="space-y-2">
              {MENSAJES[ocasion].map(t => (
                <button key={t} onClick={() => { setMensaje(t); setEditando(false); }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-[15px] ${mensaje === t ? "border-menta bg-menta-suave" : "border-borde bg-panel"}`}>
                  {mensaje === t && <span className="mr-1 text-menta">✓</span>}{t}
                </button>
              ))}
            </div>
            <textarea value={MENSAJES[ocasion].includes(mensaje) ? "" : mensaje} rows={2}
              onChange={e => { setMensaje(e.target.value.slice(0, MENSAJE_REGALO_MAX)); setEditando(true); }}
              placeholder="✨ O escribilo con tus palabras" className={`${campo} mt-2 resize-none placeholder:text-menta/80`} />
          </div>
          <div>
            <p className={etiqueta}>De parte de</p>
            <input value={de} onChange={e => setDe(e.target.value.slice(0, NOMBRE_MAX))} placeholder="Tu nombre" className={campo} />
          </div>
          <div>
            <p className={etiqueta}>Así le va a llegar</p>
            <div className="flex items-center gap-4 rounded-3xl border border-menta bg-panel p-4 shadow-[0_0_30px_rgba(127,224,168,.12)]">
              <span className="text-4xl">🎁</span>
              <span><b className="block text-lg">{de.trim() || "Vos"} te mandó un Chumbo</b>
                <span className="text-sm text-suave">{sorpresa ? "Hay una sorpresa para vos" : prod.nombre}</span></span>
            </div>
          </div>
          <button onClick={() => setSorpresa(!sorpresa)} role="switch" aria-checked={sorpresa}
            className="flex w-full items-center justify-between rounded-2xl border border-borde bg-panel px-4 py-4">
            <span>🎁 Que sea sorpresa</span>
            <span className={`relative h-7 w-12 rounded-full transition ${sorpresa ? "bg-menta" : "bg-borde"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-fondo transition-all ${sorpresa ? "left-6" : "left-1"}`} />
            </span>
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="mt-4 flex-1 space-y-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">Revisá tu Chumbo</h1>
          <div className="flex items-center gap-3 rounded-2xl border border-borde bg-panel p-4">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-papel text-3xl">{prod.emoji}</span>
            <span><b className="block text-lg">{prod.nombre}</b><span className="text-sm text-suave">Para {nombrePara} · vence en {DIAS_VENCIMIENTO} días</span></span>
          </div>
          <div className="space-y-3 rounded-2xl border border-borde bg-panel p-4">
            <div className="flex justify-between text-suave"><span>Regalo</span><span>{formatoPesos(prod.precio)}</span></div>
            <div className="flex justify-between text-suave"><span>Costo de servicio</span><span>$0</span></div>
            <div className="flex justify-between border-t border-borde pt-3 text-lg font-bold"><span>Total</span><span>{formatoPesos(prod.precio)}</span></div>
          </div>
          <p className="text-sm text-suave">Se canjea en cualquier estación adherida mostrando el código.</p>
          {error && <p className="rounded-2xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
        </div>
      )}

      {/* Botón de abajo */}
      <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-fondo via-fondo to-transparent pb-2 pt-4">
        {paso < 3 ? (
          <button onClick={() => setPaso(paso + 1)} disabled={paso === 1 ? !puedeSeguir1 : !puedeSeguir2}
            className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98] disabled:opacity-40">
            Seguir
          </button>
        ) : (
          <>
            <button onClick={pagar} disabled={cargando}
              className="w-full rounded-full bg-papel py-5 text-lg font-bold text-tinta transition active:scale-[.98] disabled:opacity-60">
              {cargando ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
            </button>
            <p className="mt-3 text-center text-xs text-suave">No necesitás cuenta en Chumbo. Chumbo nunca ve los datos de tu tarjeta.</p>
          </>
        )}
      </div>
    </div>
  );
}
