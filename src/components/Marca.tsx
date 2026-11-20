import Link from "next/link";
import Semilla from "./Semilla";

export default function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Chumbo, inicio">
      <Semilla className="h-7 w-7" />
      <span className="text-xl font-extrabold tracking-tight">chumbo</span>
    </Link>
  );
}
