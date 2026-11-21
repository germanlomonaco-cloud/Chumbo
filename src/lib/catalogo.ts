// Catálogo de regalos (por ahora fijo; después lo cargan los comercios desde su panel).
export type Producto = { id: string; emoji: string; nombre: string; detalle: string; precio: number };

export const CATALOGO: Producto[] = [
  { id: "cafe", emoji: "☕", nombre: "Café + medialunas", detalle: "Estaciones adheridas", precio: 10000 },
  { id: "combo", emoji: "🍔", nombre: "Combo hamburguesa", detalle: "Con bebida", precio: 15000 },
  { id: "agua", emoji: "💧", nombre: "Agua mineral", detalle: "Estaciones adheridas", precio: 3000 },
  { id: "sorpresa", emoji: "🎁", nombre: "Sorpresa", detalle: "Que lo elija él", precio: 20000 },
];

export const buscarProducto = (id: string) => CATALOGO.find(p => p.id === id) ?? null;

export const OCASIONES = [
  { id: "cumple", etiqueta: "🎂 Cumple" },
  { id: "gracias", etiqueta: "🙏 Gracias" },
  { id: "porque-si", etiqueta: "✨ Porque sí" },
] as const;
export type Ocasion = (typeof OCASIONES)[number]["id"];

export const MENSAJES: Record<Ocasion, string[]> = {
  cumple: ["¡Feliz cumple! Este va por mí 🎉💚", "Que tengas un año genial. Este va de mi parte 🥳", "No llego a abrazarte, pero te mando esto 🫶"],
  gracias: ["¡Gracias por todo! Te lo merecés 💚", "Por la buena onda de siempre 🙌", "Un mimo para agradecerte ✨"],
  "porque-si": ["Porque sí, porque te quiero 💚", "Para alegrarte el día ☀️", "Un gustito, sin motivo 😄"],
};

export const MENSAJE_REGALO_MAX = 160;
export const NOMBRE_MAX = 40;
export const DIAS_VENCIMIENTO = 30;
