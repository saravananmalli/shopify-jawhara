import type { ButtonHTMLAttributes, ReactNode } from "react";

/** The shared "Dubai Bestseller" chip look (colour, type, tracking) — one
 * definition, sized separately by <Chip> and <ChipButton>. */
const CHIP_STYLE =
  "inline-flex items-center gap-1.5 rounded-full border font-sans text-[11px] font-semibold uppercase tracking-[1.6px] sm:tracking-[2.2px]";

/** Shared pill/badge style — reused wherever the "Dubai Bestseller" chip
 * color scheme appears (product cards, section eyebrows, ...) so it's
 * defined once instead of duplicated per component. */
export default function Chip({
  children,
  className = "",
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  /** "dark" is for chips sitting on a brown/photo overlay; "deep" is the
   * deeper gold used as an eyebrow above a primary-gold heading. */
  tone?: "light" | "dark" | "deep";
}) {
  const TONE_STYLES = {
    light: "border-[#E6D7BE] bg-cream-100 text-gold-600",
    deep: "border-[#E6D7BE] bg-cream-100 text-gold-800",
    dark: "border-cream-50/15 bg-cream-50/10 text-cream-50",
  } as const;
  const toneStyle = TONE_STYLES[tone];
  return (
    <span className={`${CHIP_STYLE} ${toneStyle} px-2.5 py-1 ${className}`}>
      {children}
    </span>
  );
}

/**
 * Interactive version of <Chip> for filters/toggles. `active` fills it with
 * the primary gold; it's also exposed as `aria-pressed` so the state isn't
 * conveyed by colour alone.
 */
export function ChipButton({
  children,
  active,
  className = "",
  ...props
}: {
  children: ReactNode;
  active: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${CHIP_STYLE} shrink-0 snap-start whitespace-nowrap px-3.5 py-2 transition-colors ${
        active
          ? "border-gold-600 bg-gold-600 text-white"
          : "border-[#E6D7BE] bg-cream-100 text-gold-600 hover:border-gold-600"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
