"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Semilla from "./Semilla";
import { formatoPesos } from "@/lib/reglas";

type Estado = "pendiente" | "aprobada" | "rechazada";

// La vuelta del checkout NO confirma el pago: esperamos a que el aviso de Mercado Pago
// actualice la propina en nuestra base. Mientras tanto, consultamos cada 3 segundos.
export default function EstadoPago(props: { id: string; usuario: string; nombre: string; inicial: Estado; monto: number; semillas: number }) {
  const [estado, setEstado] = useState<Estado>(props.inicial);
  const [semillas, setSemillas] = useState(props.semillas);
  const [demorado, setDemorado] = useState(false);

  useEffect(() => {
    if (estado !== "pendiente") return;
    let intentos = 0;
    const t = setInterval(async () => {
      intentos++;
      if (intentos > 20) { setDemorado(true); clearInterval(t); return; }   // ~1 minuto
      const r = await fetch(`/api/propinas/${props.id}`, { cache: "no-store" }).catch(() => null);
      if (!r?.ok) return;
      const d = await r.json();
      if (d.estado !== "pendiente") { setEstado(d.estado); setSemillas(d.semillas); clearInterval(t); }
    }, 3000);
    return () => clearInterval(t);
  }, [estado, props.id]);

  if (estado === "aprobada") return (
    <div className="flex flex-col items-center text-center">
      <Semilla size={110} halo className="latido" />
      <h1 className="mt-12 text-3xl font-bold tracking-tight">¡Gracias!</h1>
      <p className="mt-3 text-lg text-suave">Tu propina de {formatoPesos(props.monto)} para {props.nombre} ya está acreditada.</p>
      <p className="mt-6 rounded-full border border-menta bg-menta-suave px-5 py-2 text-lg font-bold text-menta">+{semillas} {semillas === 1 ? "punto" : "puntos"}</p>
      <Link href={`/${props.usuario}`} className="mt-10 w-full rounded-full border border-borde py-4 text-center font-bold">Volver al perfil</Link>
    </div>
  );

  if (estado === "rechazada") return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight">El pago no se completó</h1>
      <p className="mt-3 text-suave">No se cobró nada. Podés intentarlo de nuevo.</p>
      <Link href={`/${props.usuario}`} className="mt-10 w-full rounded-full bg-menta py-5 text-center text-lg font-bold text-menta-hondo">Volver a intentar</Link>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center">
      <Semilla size={84} halo className="latido" />
      <h1 className="mt-12 text-2xl font-bold tracking-tight">Estamos confirmando tu pago</h1>
      <p className="mt-3 text-suave">
        {demorado ? "Mercado Pago está tardando un poco. Cuando se confirme, la propina se acredita sola." : "Esto tarda unos segundos…"}
      </p>
    </div>
  );
}
