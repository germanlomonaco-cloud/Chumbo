"use client";

import { useState } from "react";

// Botones debajo del QR: compartir el link, descargar la imagen e imprimir.
export default function AccionesQR({ link, usuario, nombre }: { link: string; usuario: string; nombre: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const texto = `Si te gustó la atención, podés dejarme una propina acá 💚`;
    if (navigator.share) {
      try { await navigator.share({ title: `${nombre} en Chumbo`, text: texto, url: link }); return; } catch { /* canceló */ }
    }
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin permiso */ }
  }

  return (
    <div className="mt-6 space-y-3">
      <button onClick={compartir} className="w-full rounded-full bg-menta py-5 text-lg font-bold text-menta-hondo transition active:scale-[.98]">
        {copiado ? "¡Link copiado!" : "Compartir mi link"}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <a href={`/api/qr/${usuario}`} download={`chumbo-${usuario}.png`}
          className="rounded-full border border-borde bg-panel py-4 text-center font-bold">Descargar QR</a>
        <button onClick={() => window.print()} className="rounded-full border border-borde bg-panel py-4 font-bold">Imprimir</button>
      </div>
    </div>
  );
}
