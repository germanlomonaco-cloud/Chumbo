// Perfiles de prueba. Más adelante van a vivir en Supabase.
export type Perfil = {
  usuario: string;
  nombre: string;
  rol: string;
  foto: string;
};

const PERFILES: Record<string, Perfil> = {
  german: {
    usuario: "german",
    nombre: "Germán",
    rol: "Perfil de prueba",
    foto: "/perfiles/german.svg",
  },
};

export function buscarPerfil(usuario: string): Perfil | null {
  return PERFILES[usuario.toLowerCase()] ?? null;
}
