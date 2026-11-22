import type { Perfil } from "@/lib/perfiles";

// Foto del perfil, o su inicial sobre el color que eligió.
export default function AvatarPerfil({ perfil, size = 112 }: { perfil: Pick<Perfil, "nombre" | "color" | "foto">; size?: number }) {
  const estilo = { width: size, height: size };
  if (perfil.foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={perfil.foto} alt={`Foto de ${perfil.nombre}`} style={estilo} className="rounded-full object-cover" />;
  }
  return (
    <div style={{ ...estilo, background: perfil.color, fontSize: size * 0.46 }}
      className="grid place-items-center rounded-full font-bold text-black/65" aria-label={perfil.nombre}>
      {perfil.nombre.trim().charAt(0).toUpperCase()}
    </div>
  );
}
