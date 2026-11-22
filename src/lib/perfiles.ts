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

// Direcciones que ya usa la app: nadie puede elegirlas como link.
export const RESERVADOS = new Set([
  "api", "r", "regalar", "comercio", "comercios", "pronto", "inicio", "crear", "mi-link", "mis-chumbos",
  "admin", "chumbo", "ayuda", "soporte", "login", "entrar", "salir", "perfil", "perfiles", "qr", "app",
  "manifest", "icon", "favicon", "robots", "sitemap", "german", "prueba", "test",
]);

export const ROLES = ["Mozo/a", "Barista", "Delivery", "Bartender", "Creador/a", "Músico/a", "Peluquero/a", "Otro"];
export const COLORES = ["#f2b46b", "#7fe0a8", "#b9a6f5", "#8fd3f5", "#f59fb0", "#f5e08f"];

export const USUARIO_VALIDO = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

// Convierte un nombre en un link posible: "Martín Pérez" → "martin-perez"
export function sugerirUsuario(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30).replace(/-+$/, "");
}

export async function buscarPerfil(usuario: string): Promise<Perfil | null> {
  const u = usuario.toLowerCase();
  if (DEMO[u]) return DEMO[u];
  if (!USUARIO_VALIDO.test(u) || RESERVADOS.has(u)) return null;
  return leerPerfil(u).catch(() => null);
}
