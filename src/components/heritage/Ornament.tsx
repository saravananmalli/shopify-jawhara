/** Thin gold rule with a small jewel at its centre; the two halves draw
 * outward from the jewel when it scrolls into view. */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`her-ornament ${className}`} data-reveal="draw" aria-hidden>
      <span className="her-ornament-line" />
      <svg viewBox="0 0 12 12" className="her-ornament-gem" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 .8 11.2 6 6 11.2.8 6z" />
        <path d="M6 3.6 8.4 6 6 8.4 3.6 6z" fill="currentColor" />
      </svg>
      <span className="her-ornament-line" />
    </div>
  );
}
