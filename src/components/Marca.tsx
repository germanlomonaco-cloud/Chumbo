import Link from "next/link";

// Logo de texto: "chumbo." con el punto en verde menta.
export default function Marca({ className = "text-xl" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Chumbo, inicio" className={`font-extrabold tracking-[-0.04em] ${className}`}>
      chumbo<span className="text-menta">.</span>
    </Link>
  );
}
