import { leerPerfil } from "./supabase";

export type Perfil = {
  usuario: string;
  nombre: string;
  rol: string;
  color: string;
  foto?: string;
};

// Perfil de demostración (no está en la base).
const DEMO: Record<string, Perfil> = {
  german: { usuario: "german", nombre: "Germán", rol: "Perfil de prueba", color: "#f2b46b", foto: "/perfiles/german.svg" },
};

export { RESERVADOS, ROLES, COLORES, USUARIO_VALIDO, sugerirUsuario } from "./perfil-reglas";
import { RESERVADOS, USUARIO_VALIDO } from "./perfil-reglas";

export async function buscarPerfil(usuario: string): Promise<Perfil | null> {
  const u = usuario.toLowerCase();
  if (DEMO[u]) return DEMO[u];
  if (!USUARIO_VALIDO.test(u) || RESERVADOS.has(u)) return null;
  return leerPerfil(u).catch(() => null);
}
