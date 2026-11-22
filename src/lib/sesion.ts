import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "./env";

// Sesión de "Mis Chumbos": una cookie con el usuario y la fecha de vencimiento, firmada por el servidor.
// La firma impide que alguien la modifique para entrar como otra persona. El navegador no la puede leer (httpOnly).
export const COOKIE_SESION = "chumbo_sesion";
const DIAS = 30;

// La llave de firma se deriva de la clave de servicio (que sólo existe en el servidor).
const llave = () => createHmac("sha256", env.supabaseServiceKey()).update("chumbo-sesion-v1").digest();
const firmar = (datos: string) => createHmac("sha256", llave()).update(datos).digest("base64url");

export function crearValorSesion(usuario: string) {
  const datos = `${usuario}.${Date.now() + DIAS * 86400_000}`;
  return `${datos}.${firmar(datos)}`;
}

export function leerValorSesion(valor: string | undefined): string | null {
  if (!valor) return null;
  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [usuario, vence, firma] = partes;
  const esperada = Buffer.from(firmar(`${usuario}.${vence}`));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  if (!(Number(vence) > Date.now())) return null;
  return usuario;
}

export const opcionesCookie = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: DIAS * 86400,
};

export async function usuarioDeSesion() {
  return leerValorSesion((await cookies()).get(COOKIE_SESION)?.value);
}
