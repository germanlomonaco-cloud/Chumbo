// El símbolo de Chumbo: una semillita con un brote.
export default function Semilla({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 30c0-9 6-15 15-16-1 9-7 15-15 16z" fill="#3ee6a8" />
      <path d="M32 30c0-7-5-12-12-13 1 7 5 12 12 13z" fill="#22b884" />
      <path d="M32 30v8" stroke="#3ee6a8" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="46" rx="11" ry="9" fill="#3ee6a8" />
      <ellipse cx="28.5" cy="43" rx="3" ry="2" fill="#000" opacity=".25" />
    </svg>
  );
}
