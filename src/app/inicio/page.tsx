import type { Metadata } from "next";
import PantallaInicio from "@/components/PantallaInicio";

export const metadata: Metadata = { title: "Inicio · Chumbo (vista previa)" };

type Props = { searchParams: Promise<{ opcion?: string }> };

// Vista previa de la pantalla principal (diseño "Pantalla de inicio: 3 opciones").
export default async function Inicio({ searchParams }: Props) {
  const o = ((await searchParams).opcion || "a").toLowerCase();
  return <PantallaInicio opcion={o === "b" || o === "c" ? o : "a"} />;
}
