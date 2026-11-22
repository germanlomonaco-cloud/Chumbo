"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Semilla from "./Semilla";

const campo = "w-full rounded-2xl border border-borde bg-panel px-4 py-4 text-lg outline-none focus:border-menta";

// Entrada a "Mis Chumbos" con tu link y tu PIN.
export default function EntrarMisChumbos() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya creaste tu perfil en este celu, completamos tu link.
  useEffect(() => {
    try { const m = JSON.parse(localStorage.getItem("chumbo-mi-perfil") || "null"); if (m?.usuario) setUsuario(m.usuario); } catch { /* nada */ }
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true); setError(null);
    try {
      const r = await fetch("/api/mis-chumbos/entrar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario, pin }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No pudimos entrar.");
      try { localStorage.setItem("chumbo-mi-perfil", JSON.stringify({ usuario: d.usuario, nombre: d.nombre })); } catch { /* modo privado */ }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos entrar.");
      setPin("");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="flex flex-1 flex-col">
      <div className="mt-10 flex flex-col items-center text-center">
        <Semilla size={72} halo className="latido" />
        <h1 className="mt-10 text-[28px] font-bold tracking-tight">Mis Chumbos</h1>
        <p className="mt-2 text-suave">Mirá las propinas que recibiste y las semillas que sumaste.</p>
      </div>
      <label className="mb-2 mt-10 block text-xs font-bold uppercase tracking-[.08em] text-suave" htmlFor="usuario">Tu link</label>
      <input id="usuario" value={usuario} onChange={e => setUsuario(e.target.value.toLowerCase().trim())} placeholder="ej.: martin-perez"
        autoCapitalize="none" autoCorrect="off" spellCheck={false} className={campo} />
      <label className="mb-2 mt-6 block text-xs font-bold uppercase tracking-[.08em] text-suave" htmlFor="pin">Tu PIN</label>
      <input id="pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} className={`${campo} text-center tracking-[.3em]`} />
      {error && <p className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-center text-red-200">{error}</p>}
      <button disabled={!usuario || pin.length < 4 || enviando}
        className="mt-8 w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98] disabled:opacity-40">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
      <p className="mt-8 text-center text-sm text-suave">¿Todavía no tenés tu link? <Link href="/crear" className="font-bold text-menta underline">Crealo acá</Link></p>
    </form>
  );
}
