/** Eyebrow + title (+ optional subtitle) shared by every home section that
 * uses this exact heading treatment (product shelves, customer reviews,
 * shop-by-occasion). Sections with a different type treatment (serif
 * headings, no eyebrow, etc.) keep their own markup rather than being
 * forced into this component. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  eyebrowClassName = "",
  titleClassName = "",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  id?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
}) {
  return (
    <div>
      <p className={`font-sans text-xs font-semibold uppercase tracking-widest text-gold-800 ${eyebrowClassName}`}>
        {eyebrow}
      </p>
      <h2 id={id} className={`mt-1 font-sans text-2xl font-normal text-gold-600 sm:text-[28px] ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && <p className="mt-1 font-sans text-sm text-brown-900/60">{subtitle}</p>}
    </div>
  );
}
