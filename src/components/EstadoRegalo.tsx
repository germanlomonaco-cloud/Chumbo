"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Semilla from "./Semilla";

type Estado = "pendiente" | "aprobado" | "rechazado";

// Igual que con las propinas: la vuelta del checkout NO confirma nada; esperamos el aviso de Mercado Pago.
export default function EstadoRegalo(props: { id: string; para: string; de: string; inicial: Estado; codigo: string | null }) {
  const [estado, setEstado] = useState<Estado>(props.inicial);
  const [codigo, setCodigo] = useState(props.codigo);
  const [demorado, setDemorado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (estado !== "pendiente") return;
    let intentos = 0;
    const t = setInterval(async () => {
      if (++intentos > 20) { setDemorado(true); clearInterval(t); return; }
      const r = await fetch(`/api/regalos/${props.id}`, { cache: "no-store" }).catch(() => null);
      if (!r?.ok) return;
      const d = await r.json();
      if (d.estado !== "pendiente") { setEstado(d.estado); setCodigo(d.codigo); clearInterval(t); }
    }, 3000);
    return () => clearInterval(t);
  }, [estado, props.id]);

  if (estado === "aprobado" && codigo) {
    const link = `${window.location.origin}/r/${codigo}`;
    const texto = `${props.de} te mandó un Chumbo 🎁 Abrilo acá: ${link}`;
    return (
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-40 w-40 place-items-center">
          <div className="halo" style={{ width: 300, height: 300 }} />
          <span className="latido text-8xl">🎁</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">¡Tu Chumbo está listo!</h1>
        <p className="mt-3 text-lg text-suave">Mandáselo a {props.para} para que lo abra.</p>
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener"
          className="mt-8 w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Mandar por WhatsApp</a>
        <button onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); setCopiado(true); }}
          className="mt-3 w-full rounded-full border border-borde py-4 font-bold">{copiado ? "¡Link copiado!" : "Copiar link"}</button>
        <Link href="/" className="mt-6 text-sm text-suave underline">Volver al inicio</Link>
      </div>
    );
  }

  if (estado === "rechazado") return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight">El pago no se completó</h1>
      <p className="mt-3 text-suave">No se cobró nada. Podés intentarlo de nuevo.</p>
      <Link href="/regalar" className="mt-10 w-full rounded-full bg-menta py-5 text-center text-lg font-bold text-menta-hondo">Volver a intentar</Link>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center">
      <Semilla size={84} halo className="latido" />
      <h1 className="mt-12 text-2xl font-bold tracking-tight">Estamos confirmando tu pago</h1>
      <p className="mt-3 text-suave">
        {demorado ? "Mercado Pago está tardando un poco. Cuando se confirme, tu Chumbo queda listo." : "Esto tarda unos segundos…"}
      </p>
    </div>
  );
}
