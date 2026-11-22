import type { Metadata } from "next";
import Marca from "@/components/Marca";
import EntrarMisChumbos from "@/components/EntrarMisChumbos";
import PanelMisChumbos, { type PropinaVista } from "@/components/PanelMisChumbos";
import { usuarioDeSesion } from "@/lib/sesion";
import { leerPerfil, propinasDe } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis Chumbos", robots: { index: false } };

const ZONA = "America/Argentina/Buenos_Aires";

// Fecha amigable: "Hoy 14:32", "Ayer 09:10" o "12 nov · 18:05" (siempre en hora argentina)
function fechaLinda(iso: string) {
  const d = new Date(iso);
  const dia = (x: Date) => x.toLocaleDateString("es-AR", { timeZone: ZONA });
  const hora = d.toLocaleTimeString("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
  const hoy = new Date();
  if (dia(d) === dia(hoy)) return `Hoy ${hora}`;
  if (dia(d) === dia(new Date(hoy.getTime() - 86400_000))) return `Ayer ${hora}`;
  return `${d.toLocaleDateString("es-AR", { timeZone: ZONA, day: "numeric", month: "short" }).replace(".", "")} · ${hora}`;
}

export default async function MisChumbos() {
  const usuario = await usuarioDeSesion();
  const perfil = usuario ? await leerPerfil(usuario).catch(() => null) : null;

  let contenido;
  if (!perfil) {
    contenido = <EntrarMisChumbos />;
  } else {
    const propinas = await propinasDe(perfil.usuario).catch(() => null);
    const lista: PropinaVista[] = (propinas || []).map(p => ({
      id: p.id, monto: p.monto, mensaje: p.mensaje, semillas: p.semillas, fecha: fechaLinda(p.creado),
    }));
    // Lo del mes en curso (hora argentina)
    const mesActual = new Date().toLocaleDateString("es-AR", { timeZone: ZONA, month: "numeric", year: "numeric" });
    const delMes = (propinas || []).filter(p => new Date(p.creado).toLocaleDateString("es-AR", { timeZone: ZONA, month: "numeric", year: "numeric" }) === mesActual);
    contenido = (
      <PanelMisChumbos perfil={perfil} propinas={lista} error={propinas === null}
        totales={{
          semillas: (propinas || []).reduce((a, p) => a + p.semillas, 0),
          pesos: (propinas || []).reduce((a, p) => a + p.monto, 0),
          cantidad: (propinas || []).length,
          pesosMes: delMes.reduce((a, p) => a + p.monto, 0),
        }} />
    );
  }

  return (
    <main className="brillo min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
        {!perfil && <header className="flex justify-center"><Marca /></header>}
        {contenido}
      </div>
    </main>
  );
}
