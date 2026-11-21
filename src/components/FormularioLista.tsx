"use client";

import { useState } from "react";
import Semilla from "./Semilla";

const campo = "w-full rounded-2xl border border-borde bg-panel px-4 py-4 text-[16px] text-texto placeholder:text-suave/70 focus:border-menta focus:outline-none";

export default function FormularioLista({ origen }: { origen?: string }) {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [web, setWeb] = useState("");          // campo trampa (oculto)
  const [estado, setEstado] = useState<"listo" | "enviando" | "ok">("listo");
  const [repetido, setRepetido] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando"); setError(null);
    try {
      const r = await fetch("/api/lista", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, contacto, web, origen }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No pudimos anotarte.");
      setRepetido(!!d.repetido); setEstado("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos anotarte.");
      setEstado("listo");
    }
  }

  if (estado === "ok") return (
    <div className="flex flex-col items-center text-center">
      <Semilla size={64} halo className="latido" />
      <h2 className="mt-10 text-2xl font-bold">{repetido ? "¡Ya estabas anotado!" : "¡Listo, estás en la lista!"}</h2>
      <p className="mt-2 text-suave">Te avisamos apenas Chumbo esté disponible. 💚</p>
    </div>
  );

  return (
    <form onSubmit={enviar} className="w-full space-y-3">
      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className={campo} autoComplete="given-name" required maxLength={60} />
      <input value={contacto} onChange={e => setContacto(e.target.value)} placeholder="Tu WhatsApp o mail" className={campo} autoComplete="email" required maxLength={120} />
      <input value={web} onChange={e => setWeb(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="web" />
      {error && <p className="rounded-2xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
      <button disabled={estado === "enviando"} className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98] disabled:opacity-60">
        {estado === "enviando" ? "Anotando…" : "Avisame cuando salga"}
      </button>
      <p className="text-center text-xs text-suave">Usamos tus datos sólo para avisarte del lanzamiento. Nada de spam.</p>
    </form>
  );
}
