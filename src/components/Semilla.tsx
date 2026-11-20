// El símbolo de Chumbo: una esfera verde con su hojita (igual que en el diseño).
export default function Semilla({ size = 40, halo = false, className = "" }: { size?: number; halo?: boolean; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {halo && <div className="halo" style={{ width: size * 2.6, height: size * 2.6 }} />}
      <div className="semilla" style={{ width: size, height: size }}>
        <div className="b" />
        <div className="l" />
      </div>
    </div>
  );
}
