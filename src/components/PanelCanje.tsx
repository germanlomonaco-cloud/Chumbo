"use client";

import { useEffect, useRef, useState } from "react";
import Marca from "./Marca";
import { formatoPesos } from "@/lib/reglas";

type Sesion = { slug: string; pin: string; nombre: string };
type Resultado = {
  ok: boolean; error?: string; mensaje?: string; producto?: string; para?: string; de?: string;
  monto?: number; canjeado?: boolean; canjeado_en?: string | null; vence?: string | null;
};

const CLAVE = "chumbo-comercio";
const campo = "w-full rounded-2xl border border-borde bg-panel px-4 py-4 text-[17px] text-texto placeholder:text-suave/70 focus:border-menta focus:outline-none";
const fecha = (s?: string | null) => s ? new Date(s).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

// Detector de QR del navegador (Chrome en Android lo trae; iPhone todavía no)
type Detector = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
declare global { interface Window { BarcodeDetector?: new (o: { formats: string[] }) => Detector } }

async function post(url: string, body: object): Promise<Resultado> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json().catch(() => ({ ok: false, mensaje: "No pudimos conectarnos." }));
}

function Ingreso({ alEntrar }: { alEntrar: (s: Sesion) => void }) {
  const [slug, setSlug] = useState(""); const [pin, setPin] = useState("");
  const [cargando, setCargando] = useState(false); const [error, setError] = useState<string | null>(null);
  async function entrar(e: React.FormEvent) {
    e.preventDefault(); setCargando(true); setError(null);
    const r = await post("/api/comercio/login", { slug, pin });
    setCargando(false);
    if (r.ok && r.mensaje === undefined) alEntrar({ slug: slug.trim().toLowerCase(), pin, nombre: (r as { nombre?: string }).nombre || slug });
    else setError(r.mensaje || "No pudimos entrar.");
  }
  return (
    <form onSubmit={entrar} className="mt-8 space-y-3">
      <h1 className="text-[26px] font-bold tracking-tight">Panel del comercio</h1>
      <p className="text-suave">Entrá con el código de tu comercio y tu PIN.</p>
      <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Código de comercio" className={campo} autoCapitalize="none" autoCorrect="off" required />
      <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} placeholder="PIN" className={campo} inputMode="numeric" type="password" autoComplete="current-password" required maxLength={12} />
      {error && <p className="rounded-2xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
      <button disabled={cargando} className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo disabled:opacity-60">{cargando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

function Escaner({ alLeer }: { alLeer: (texto: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [activo, setActivo] = useState(false);
  const [soportado, setSoportado] = useState<boolean | null>(null);
  useEffect(() => { setSoportado(typeof window !== "undefined" && !!window.BarcodeDetector && !!navigator.mediaDevices); }, []);
  useEffect(() => {
    if (!activo) return;
    let corriendo = true, stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!video.current) return;
        video.current.srcObject = stream; await video.current.play();
        const det = new window.BarcodeDetector!({ formats: ["qr_code"] });
        while (corriendo) {
          const r = await det.detect(video.current).catch(() => []);
          if (r[0]?.rawValue) { alLeer(r[0].rawValue); break; }
          await new Promise(res => setTimeout(res, 250));
        }
      } catch { setSoportado(false); }
      setActivo(false);
    })();
    return () => { corriendo = false; stream?.getTracks().forEach(t => t.stop()); };
  }, [activo, alLeer]);

  if (soportado === false) return null;
  return (
    <div className="relative mt-5 grid aspect-square w-full place-items-center overflow-hidden rounded-3xl border border-borde bg-panel">
      {activo ? <video ref={video} className="absolute inset-0 h-full w-full object-cover" playsInline muted /> : (
        <button onClick={() => setActivo(true)} className="flex flex-col items-center gap-3 text-suave">
          <span className="grid h-28 w-28 place-items-center rounded-2xl border-4 border-menta"><span className="h-0.5 w-20 bg-menta" /></span>
          <span className="font-bold text-texto">Escanear QR</span>
        </button>
      )}
      {activo && <span className="pointer-events-none relative h-48 w-48 rounded-3xl border-4 border-menta" />}
    </div>
  );
}

export default function PanelCanje() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(CLAVE); if (s) setSesion(JSON.parse(s)); } catch {}
    setListo(true);
  }, []);

  function entrar(s: Sesion) { setSesion(s); try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch {} }
  function salir() { setSesion(null); setRes(null); setCodigo(""); try { localStorage.removeItem(CLAVE); } catch {} }

  async function consultar(c = codigo) {
    if (!sesion) return;
    setCargando(true); setRes(null);
    const r = await post("/api/comercio/consultar", { slug: sesion.slug, pin: sesion.pin, codigo: c });
    setCargando(false);
    if (r.error === "datos_incorrectos" || r.error === "bloqueado") { salir(); return; }
    setRes(r);
  }
  async function canjear() {
    if (!sesion) return;
    setCargando(true);
    const r = await post("/api/comercio/canjear", { slug: sesion.slug, pin: sesion.pin, codigo });
    setCargando(false); setRes(r);
  }
  function otro() { setRes(null); setCodigo(""); }

  const leerQR = (texto: string) => { const c = texto.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/^CHB/, "").slice(0, 6); setCodigo(c); consultar(c); };

  if (!listo) return null;
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between">
        <Marca />
        <span className="rounded-full bg-calido px-3 py-1 text-xs font-bold tracking-[.08em] text-[#5a3300]">{sesion ? "CANJEAR" : "COMERCIOS"}</span>
      </header>

      {!sesion ? <Ingreso alEntrar={entrar} /> : (
        <>
          <p className="mt-4 text-sm text-suave">{sesion.nombre} · <button onClick={salir} className="underline">Salir</button></p>

          {res?.ok && res.canjeado ? (
            <div className="mt-10 flex flex-1 flex-col items-center text-center">
              <span className="grid h-28 w-28 place-items-center rounded-full bg-menta text-6xl text-menta-hondo shadow-[0_0_40px_rgba(127,224,168,.45)]">✓</span>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">¡Entregado!</h1>
              <p className="mt-2 text-lg text-suave">{res.producto} para {res.para}</p>
              <p className="mt-1 text-sm text-suave">Canjeado el {fecha(res.canjeado_en)}</p>
              <button onClick={otro} className="mt-10 w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo">Canjear otro</button>
            </div>
          ) : (
            <>
              {!res && <Escaner alLeer={leerQR} />}
              <p className="mt-5 text-center text-sm text-suave">{res ? "Código" : "Escaneá el QR o tipeá el código"}</p>
              <div className="mt-3 flex gap-3">
                <span className="grid w-28 place-items-center rounded-2xl border border-borde bg-panel font-mono text-xl font-bold">CHB</span>
                <input value={codigo} onChange={e => { setCodigo(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 6)); setRes(null); }}
                  placeholder="7K4PQX" className={`${campo} text-center font-mono text-xl font-bold tracking-[.2em]`} autoCapitalize="characters" autoCorrect="off" />
              </div>

              {res && !res.ok && (
                <div className="mt-5 rounded-3xl border border-red-400/40 bg-red-500/10 p-5">
                  <p className="font-bold text-red-300">
                    {res.error === "canjeado" ? `✕ Ya fue canjeado el ${fecha(res.canjeado_en)}`
                      : res.error === "vencido" ? "✕ Este regalo está vencido"
                      : res.error === "no_pagado" ? "✕ El pago de este regalo no está confirmado"
                      : res.error === "no_existe" ? "✕ Ese código no existe" : `✕ ${res.mensaje || "No se pudo verificar"}`}
                  </p>
                  <p className="mt-1 text-sm text-suave">No entregues el producto.</p>
                </div>
              )}
              {res?.ok && !res.canjeado && (
                <div className="mt-5 rounded-3xl border border-menta bg-menta-suave p-5 shadow-[0_0_30px_rgba(127,224,168,.15)]">
                  <p className="font-bold text-menta">✓ Código válido</p>
                  <p className="mt-1 text-2xl font-bold">{res.producto}</p>
                  <p className="mt-1 text-suave">Para {res.para} · regalo de {res.de}{res.monto ? ` · ${formatoPesos(res.monto)}` : ""}</p>
                </div>
              )}

              <div className="mt-auto pt-8">
                {res?.ok && !res.canjeado ? (
                  <button onClick={canjear} disabled={cargando} className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo disabled:opacity-60">
                    {cargando ? "Canjeando…" : "Entregar y marcar como usado"}
                  </button>
                ) : res ? (
                  <button onClick={otro} className="w-full rounded-full border border-borde py-5 text-lg font-bold">Probar otro código</button>
                ) : (
                  <button onClick={() => consultar()} disabled={codigo.length !== 6 || cargando} className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo disabled:opacity-40">
                    {cargando ? "Verificando…" : "Verificar código"}
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
