"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, COLORES } from "@/lib/perfil-reglas";
import { formatoPesos } from "@/lib/reglas";
import AvatarPerfil from "./AvatarPerfil";
import Semilla from "./Semilla";
import Marca from "./Marca";

export type PropinaVista = { id: string; monto: number; mensaje: string | null; semillas: number; fecha: string };
type Perfil = { usuario: string; nombre: string; rol: string; color: string };
type Totales = { semillas: number; pesos: number; cantidad: number; pesosMes: number };

const campo = "w-full rounded-2xl border border-borde bg-fondo px-4 py-3.5 text-lg outline-none focus:border-menta";

export default function PanelMisChumbos({ perfil, propinas, totales, error }: { perfil: Perfil; propinas: PropinaVista[]; totales: Totales; error: boolean }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);

  async function salir() {
    await fetch("/api/mis-chumbos/salir", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <Marca />
        <button onClick={salir} className="text-sm text-suave underline">Salir</button>
      </header>

      <section className="mt-6 flex items-center gap-4">
        <AvatarPerfil perfil={perfil} size={60} />
        <div className="min-w-0">
          <p className="text-sm text-suave">Hola,</p>
          <h1 className="truncate text-2xl font-bold tracking-tight">{perfil.nombre}</h1>
          <p className="text-sm text-suave">{perfil.rol} · /{perfil.usuario}</p>
        </div>
      </section>

      {/* Puntos */}
      <section className="mt-6 flex items-center gap-4 rounded-3xl border border-menta/40 bg-menta-suave p-5">
        <Semilla size={48} />
        <div>
          <p className="text-4xl font-extrabold leading-none text-menta">{totales.semillas.toLocaleString("es-AR")}</p>
          <p className="mt-1 text-sm text-suave">puntos sumados</p>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-borde bg-panel p-4">
          <p className="text-xs font-bold uppercase tracking-[.08em] text-suave">Este mes</p>
          <p className="mt-1 text-2xl font-bold">{formatoPesos(totales.pesosMes)}</p>
        </div>
        <div className="rounded-3xl border border-borde bg-panel p-4">
          <p className="text-xs font-bold uppercase tracking-[.08em] text-suave">En total</p>
          <p className="mt-1 text-2xl font-bold">{formatoPesos(totales.pesos)}</p>
          <p className="text-xs text-suave">{totales.cantidad} {totales.cantidad === 1 ? "propina" : "propinas"}</p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href={`/${perfil.usuario}/qr`} className="rounded-full bg-menta py-4 text-center font-bold text-menta-hondo">Mi QR</Link>
        <button onClick={() => setEditando(!editando)} className="rounded-full border border-borde bg-panel py-4 font-bold">
          {editando ? "Cerrar" : "Editar perfil"}
        </button>
      </div>

      {editando && <EditarPerfil perfil={perfil} alGuardar={() => { setEditando(false); router.refresh(); }} />}

      {/* Lista de propinas */}
      <p className="mt-8 text-xs font-bold uppercase tracking-[.08em] text-suave">Tus propinas</p>
      {error ? (
        <p className="mt-3 rounded-2xl border border-borde bg-panel p-5 text-center text-suave">No pudimos cargar tus propinas. Probá de nuevo en un rato.</p>
      ) : propinas.length === 0 ? (
        <div className="mt-3 rounded-3xl border border-dashed border-borde p-6 text-center">
          <p className="font-bold">Todavía no recibiste propinas</p>
          <p className="mt-1 text-sm text-suave">Compartí tu QR o pegalo en la caja. Cada propina que entre va a aparecer acá.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {propinas.map(p => (
            <li key={p.id} className="rounded-2xl border border-borde bg-panel p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xl font-bold">{formatoPesos(p.monto)}</span>
                <span className="shrink-0 text-xs text-suave">{p.fecha}</span>
              </div>
              {p.mensaje && <p className="mt-1.5 text-[15px] leading-snug">“{p.mensaje}”</p>}
              <p className="mt-1.5 text-xs font-bold text-menta">+{p.semillas} {p.semillas === 1 ? "punto" : "puntos"}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EditarPerfil({ perfil, alGuardar }: { perfil: Perfil; alGuardar: () => void }) {
  const esDeLista = ROLES.includes(perfil.rol);
  const [nombre, setNombre] = useState(perfil.nombre);
  const [rol, setRol] = useState(esDeLista ? perfil.rol : "Otro");
  const [otroRol, setOtroRol] = useState(esDeLista ? "" : perfil.rol);
  const [color, setColor] = useState(COLORES.includes(perfil.color) ? perfil.color : COLORES[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rolFinal = rol === "Otro" ? otroRol.trim() : rol;

  async function guardar() {
    setGuardando(true); setError(null);
    try {
      const r = await fetch("/api/mis-chumbos/perfil", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, rol: rolFinal, color }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No pudimos guardar.");
      try { localStorage.setItem("chumbo-mi-perfil", JSON.stringify({ usuario: perfil.usuario, nombre: d.nombre })); } catch { /* nada */ }
      alGuardar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar.");
      setGuardando(false);
    }
  }

  return (
    <section className="mt-4 rounded-3xl border border-borde bg-panel p-5">
      <label className="mb-2 block text-xs font-bold uppercase tracking-[.08em] text-suave" htmlFor="ed-nombre">Nombre</label>
      <input id="ed-nombre" value={nombre} onChange={e => setNombre(e.target.value.slice(0, 40))} className={campo} />
      <span className="mb-2 mt-5 block text-xs font-bold uppercase tracking-[.08em] text-suave">¿A qué te dedicás?</span>
      <div className="flex flex-wrap gap-2">
        {ROLES.map(r => (
          <button key={r} type="button" onClick={() => setRol(r)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium ${rol === r ? "border-menta bg-menta text-menta-hondo" : "border-borde bg-fondo"}`}>{r}</button>
        ))}
      </div>
      {rol === "Otro" && <input value={otroRol} onChange={e => setOtroRol(e.target.value.slice(0, 30))} placeholder="Ej.: Guía de turismo" className={`${campo} mt-3`} />}
      <span className="mb-2 mt-5 block text-xs font-bold uppercase tracking-[.08em] text-suave">Color</span>
      <div className="flex gap-3">
        {COLORES.map(c => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{ background: c }}
            className={`h-10 w-10 rounded-full ${color === c ? "ring-4 ring-white/80 ring-offset-2 ring-offset-panel" : ""}`} />
        ))}
      </div>
      <p className="mt-5 text-xs text-suave">Tu link (/{perfil.usuario}) no cambia, así tu QR impreso sigue funcionando.</p>
      {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}
      <button onClick={guardar} disabled={!nombre.trim() || !rolFinal || guardando}
        className="mt-5 w-full rounded-full bg-menta py-4 font-bold text-menta-hondo disabled:opacity-40">
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </section>
  );
}
