"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, COLORES, USUARIO_VALIDO, sugerirUsuario } from "@/lib/perfiles";
import AvatarPerfil from "./AvatarPerfil";

export const CLAVE_MI_PERFIL = "chumbo-mi-perfil";

const campo = "w-full rounded-2xl border border-borde bg-panel px-4 py-4 text-lg outline-none focus:border-menta";
const titulo = "mb-2 mt-7 block text-xs font-bold uppercase tracking-[.08em] text-suave";

type Disp = "vacio" | "chequeando" | "libre" | "ocupado" | "formato" | "error";

export default function CrearPerfil({ dominio }: { dominio: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [tocoUsuario, setTocoUsuario] = useState(false);
  const [rol, setRol] = useState("");
  const [otroRol, setOtroRol] = useState("");
  const [color, setColor] = useState(COLORES[0]);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [web, setWeb] = useState("");
  const [disp, setDisp] = useState<Disp>("vacio");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El link se arma solo a partir del nombre, hasta que la persona lo edite.
  useEffect(() => { if (!tocoUsuario) setUsuario(sugerirUsuario(nombre)); }, [nombre, tocoUsuario]);

  // Chequea si el link está libre (con una pequeña espera mientras escribe).
  useEffect(() => {
    if (!usuario) { setDisp("vacio"); return; }
    if (!USUARIO_VALIDO.test(usuario)) { setDisp("formato"); return; }
    setDisp("chequeando");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/perfiles?usuario=${encodeURIComponent(usuario)}`).then(r => r.json());
        setDisp(r.libre ? "libre" : r.motivo === "formato" ? "formato" : r.motivo === "error" ? "error" : "ocupado");
      } catch { setDisp("error"); }
    }, 400);
    return () => clearTimeout(t);
  }, [usuario]);

  const rolFinal = rol === "Otro" ? otroRol.trim() : rol;
  const pinOk = /^\d{4,8}$/.test(pin) && pin === pin2;
  const listo = nombre.trim() && disp === "libre" && rolFinal && pinOk && !enviando;

  async function crear() {
    setEnviando(true); setError(null);
    try {
      const r = await fetch("/api/perfiles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, usuario, rol: rolFinal, color, pin, web }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No pudimos crear tu perfil.");
      try { localStorage.setItem(CLAVE_MI_PERFIL, JSON.stringify({ usuario: d.usuario, nombre: nombre.trim() })); } catch { /* modo privado */ }
      router.push(`/${d.usuario}/qr`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos crear tu perfil.");
      setEnviando(false);
    }
  }

  const avisoLink: Record<Disp, string> = {
    vacio: "Es la dirección que va a abrir tu QR.",
    chequeando: "Fijándonos si está libre…",
    libre: "✓ ¡Está libre!",
    ocupado: "✕ Ya está tomado, probá con otro.",
    formato: "Usá de 3 a 30 letras, números o guiones (sin espacios ni tildes).",
    error: "No pudimos fijarnos si está libre. Probá de nuevo en un rato.",
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-6 flex flex-col items-center">
        <AvatarPerfil perfil={{ nombre: nombre || "?", color }} size={88} />
        <h1 className="mt-5 text-center text-[28px] font-bold leading-tight tracking-tight">Creá tu link para recibir propinas</h1>
        <p className="mt-2 text-center text-suave">Te damos un QR para la mesa, la caja o tus redes.</p>
      </div>

      <label className={titulo} htmlFor="nombre">Tu nombre</label>
      <input id="nombre" value={nombre} onChange={e => setNombre(e.target.value.slice(0, 40))} placeholder="Como te conocen los clientes" className={campo} autoComplete="given-name" />

      <label className={titulo} htmlFor="usuario">Tu link</label>
      <div className={`flex items-center overflow-hidden rounded-2xl border bg-panel ${disp === "ocupado" || disp === "formato" || disp === "error" ? "border-red-400/70" : disp === "libre" ? "border-menta" : "border-borde"}`}>
        <span className="shrink-0 pl-4 text-suave">{dominio}/</span>
        <input id="usuario" value={usuario} autoCapitalize="none" autoCorrect="off" spellCheck={false}
          onChange={e => { setTocoUsuario(true); setUsuario(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30)); }}
          className="min-w-0 flex-1 bg-transparent py-4 pr-4 text-lg font-bold outline-none" placeholder="tu-nombre" />
      </div>
      <p className={`mt-2 text-sm ${disp === "libre" ? "text-menta" : disp === "ocupado" || disp === "formato" || disp === "error" ? "text-red-300" : "text-suave"}`}>{avisoLink[disp]}</p>

      <span className={titulo}>¿A qué te dedicás?</span>
      <div className="flex flex-wrap gap-2">
        {ROLES.map(r => (
          <button key={r} type="button" onClick={() => setRol(r)}
            className={`rounded-full border px-4 py-2.5 font-medium ${rol === r ? "border-menta bg-menta text-menta-hondo" : "border-borde bg-panel"}`}>{r}</button>
        ))}
      </div>
      {rol === "Otro" && <input value={otroRol} onChange={e => setOtroRol(e.target.value.slice(0, 30))} placeholder="Ej.: Guía de turismo" className={`${campo} mt-3`} />}

      <span className={titulo}>Tu color</span>
      <div className="flex gap-3">
        {COLORES.map(c => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{ background: c }}
            className={`h-11 w-11 rounded-full ${color === c ? "ring-4 ring-white/80 ring-offset-2 ring-offset-fondo" : ""}`} />
        ))}
      </div>

      <label className={titulo} htmlFor="pin">Elegí un PIN</label>
      <p className="-mt-1 mb-3 text-sm text-suave">De 4 a 8 números. Lo vas a usar para entrar y ver lo que recibiste. No lo compartas.</p>
      <div className="grid grid-cols-2 gap-3">
        <input id="pin" type="password" inputMode="numeric" autoComplete="new-password" value={pin} placeholder="PIN"
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} className={`${campo} text-center tracking-[.3em]`} />
        <input type="password" inputMode="numeric" autoComplete="new-password" value={pin2} placeholder="Repetilo"
          onChange={e => setPin2(e.target.value.replace(/\D/g, "").slice(0, 8))} className={`${campo} text-center tracking-[.3em]`} />
      </div>
      {pin2.length >= 4 && pin !== pin2 && <p className="mt-2 text-sm text-red-300">Los PIN no coinciden.</p>}

      {/* Trampa para robots: invisible para las personas */}
      <input value={web} onChange={e => setWeb(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {error && <p className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-center text-red-200">{error}</p>}

      <button onClick={crear} disabled={!listo}
        className="mt-8 w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98] disabled:opacity-40">
        {enviando ? "Creando…" : "Crear mi link y mi QR"}
      </button>
    </div>
  );
}
