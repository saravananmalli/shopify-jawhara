import type { ReactNode } from "react";

/** Shared pill/badge style — reused wherever the "Dubai Bestseller" chip
 * color scheme appears (product cards, section eyebrows, ...) so it's
 * defined once instead of duplicated per component. */
export default function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#E6D7BE] bg-cream-100 px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[2.2px] text-gold-600 ${className}`}
    >
      {children}
    </span>
  );
}
