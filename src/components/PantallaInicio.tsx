"use client";

import Link from "next/link";
import { useState } from "react";
import Marca from "./Marca";

type Opcion = "a" | "b" | "c";

// Datos de ejemplo para la vista previa (después salen de Supabase)
const POPULARES = [
  { emoji: "☕", nombre: "Café", precio: "$10.000" },
  { emoji: "🍔", nombre: "Combo", precio: "$15.000" },
  { emoji: "💧", nombre: "Agua", precio: "$3.000" },
];
const OCASIONES = ["🎂 Feliz cumple", "🙏 Gracias", "🫶 Te extraño", "💪 Fuerza", "❤️ Te quiero", "✨ Porque sí"];
const PARA_CUMPLE = [
  { emoji: "☕", nombre: "Café + medialuna", detalle: "Estaciones adheridas", precio: "$10.000" },
  { emoji: "🍔", nombre: "Combo hamburguesa", detalle: "Con bebida", precio: "$15.000" },
  { emoji: "💸", nombre: "Plata de regalo", detalle: "Elegís el monto", precio: "$" },
];
const SEMANA = [
  { ini: "S", nombre: "Sofi", nota: "Cumple el viernes", color: "#b9a6f5" },
  { ini: "L", nombre: "Lucas", nota: "Volvió de viaje", color: "#8fd3f5" },
  { ini: "C", nombre: "Caro", nota: "Te mandó un Chumbo ayer 💚", color: "#f59fb0" },
];

function Avatar({ ini, color, size = 44 }: { ini: string; color: string; size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-full font-bold text-black/70" style={{ width: size, height: size, background: color }}>
      {ini}
    </div>
  );
}

function OpcionA() {
  return (
    <>
      <p className="mt-6 text-sm text-suave">Hola, Germán</p>
      <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">¿A quién le mandamos un Chumbo?</h1>
      <button className="relative mt-5 w-full overflow-hidden rounded-3xl p-5 text-left text-menta-hondo"
        style={{ background: "linear-gradient(135deg,#a9f2c9,#6fd39c)" }}>
        <span className="block text-2xl font-extrabold">Regalar</span>
        <span className="mt-1 block text-sm opacity-80">Un café, un combo, una sorpresa</span>
        <span className="absolute bottom-3 right-4 text-6xl">🎁</span>
        <span className="block h-12" />
      </button>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button className="rounded-3xl border border-borde bg-panel p-4 text-left">
          <span className="text-xl">💸</span>
          <span className="mt-2 block font-bold">Transferir</span>
          <span className="block text-sm text-suave">Plata directo</span>
        </button>
        <Link href="/german" className="rounded-3xl border border-borde bg-panel p-4 text-left">
          <span className="text-xl">💚</span>
          <span className="mt-2 block font-bold">Propina</span>
          <span className="block text-sm text-suave">Mozos y creadores</span>
        </Link>
      </div>
      <p className="mt-7 text-xs font-bold uppercase tracking-[.08em] text-suave">Regalos populares</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {POPULARES.map(r => (
          <button key={r.nombre} className="rounded-3xl bg-papel p-3 text-center text-tinta">
            <span className="block text-3xl">{r.emoji}</span>
            <span className="mt-1 block font-bold">{r.nombre}</span>
            <span className="block text-sm">{r.precio}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function OpcionB() {
  const [ocasion, setOcasion] = useState(OCASIONES[0]);
  return (
    <>
      <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-tight">¿Qué querés decir hoy?</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {OCASIONES.map(o => (
          <button key={o} onClick={() => setOcasion(o)}
            className={`rounded-full border px-4 py-2 text-[15px] font-medium ${o === ocasion ? "border-menta bg-menta text-menta-hondo" : "border-borde bg-panel"}`}>
            {o}
          </button>
        ))}
      </div>
      <p className="mt-7 text-xs font-bold uppercase tracking-[.08em] text-suave">Para un {ocasion.slice(2).toLowerCase()}</p>
      <div className="mt-3 space-y-3">
        {PARA_CUMPLE.map(r => (
          <button key={r.nombre} className="flex w-full items-center gap-3 rounded-2xl bg-papel p-3 text-left text-tinta">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-black/5 text-2xl">{r.emoji}</span>
            <span className="flex-1"><b className="block">{r.nombre}</b><span className="text-sm text-black/55">{r.detalle}</span></span>
            <b>{r.precio}</b>
          </button>
        ))}
      </div>
    </>
  );
}

function OpcionC() {
  return (
    <>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.08em] text-suave">Hoy</p>
      <div className="mt-3 flex items-center gap-3 rounded-3xl border border-menta bg-panel p-4 shadow-[0_0_30px_rgba(127,224,168,.15)]">
        <Avatar ini="M" color="#f2b46b" />
        <div className="flex-1"><b className="block">Martín cumple hoy 🎂</b><span className="text-sm text-suave">32 años</span></div>
        <button className="rounded-full bg-menta px-4 py-2 font-bold text-menta-hondo">Chumbo</button>
      </div>
      <p className="mt-7 text-xs font-bold uppercase tracking-[.08em] text-suave">Esta semana</p>
      <div className="mt-2 divide-y divide-borde">
        {SEMANA.map(p => (
          <div key={p.nombre} className="flex items-center gap-3 py-3">
            <Avatar ini={p.ini} color={p.color} />
            <div><b className="block">{p.nombre}</b><span className="text-sm text-suave">{p.nota}</span></div>
          </div>
        ))}
      </div>
      <Link href="/german" className="mt-4 flex items-center gap-4 rounded-3xl border border-borde bg-panel p-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-papel text-2xl">▦</span>
        <span><b className="block">chumbo.app/german</b><span className="text-sm text-suave">Tu link y tu QR para recibir</span></span>
      </Link>
    </>
  );
}

export default function PantallaInicio({ opcion }: { opcion: Opcion }) {
  const [o, setO] = useState<Opcion>(opcion);
  const nav = o === "c" ? ["Inicio", "Regalar", "Mi link"] : ["Inicio", "Mis Chumbos", "Mi link"];
  return (
    <main className="brillo min-h-dvh">
      {/* Selector de opciones (sólo para comparar en la vista previa) */}
      <div className="sticky top-0 z-20 bg-fondo/90 px-5 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 text-xs">
          <span className="text-suave">Vista previa:</span>
          {(["a", "b", "c"] as Opcion[]).map(k => (
            <button key={k} onClick={() => setO(k)}
              className={`rounded-full px-3 py-1 font-bold ${o === k ? "bg-menta text-menta-hondo" : "bg-panel text-suave"}`}>
              Opción {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col px-5 pb-28 pt-3">
        <header className="flex items-center justify-between">
          <Marca />
          <Avatar ini="GL" color="#181c19" size={36} />
        </header>
        {o === "a" && <OpcionA />}
        {o === "b" && <OpcionB />}
        {o === "c" && <OpcionC />}
      </div>

      {/* Barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-fondo/95 backdrop-blur">
        <div className="mx-auto flex max-w-md justify-around py-4 text-sm">
          {nav.map((n, i) => (
            <span key={n} className={i === 0 ? "font-medium text-menta" : "text-suave"}>{i === 0 && "● "}{n}</span>
          ))}
        </div>
      </nav>
    </main>
  );
}
