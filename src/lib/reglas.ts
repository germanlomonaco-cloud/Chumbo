// Reglas del negocio, en un solo lugar para cambiarlas fácil.

// Montos rápidos (en pesos)
export const MONTOS = [1000, 2000, 5000] as const;

// Largo máximo del mensaje opcional
export const MENSAJE_MAX = 140;

// Puntos (en la base se guardan como "semillas"): 1 punto cada $100 de propina ($1.000 = 10 puntos)
export const PESOS_POR_SEMILLA = 100;
export const semillasPara = (monto: number) => Math.floor(monto / PESOS_POR_SEMILLA);

export const formatoPesos = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
