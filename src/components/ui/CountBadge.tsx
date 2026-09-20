/**
 * Count bubble pinned to the top-end corner of an icon (bag / wishlist).
 * The parent must be `relative` and wrap only the icon. The line icons have
 * inset artwork, so the bubble overlaps the icon's corner instead of
 * floating clear of it; `min-w-4` + padding lets two digits grow it sideways.
 * Hidden from assistive tech: the count is already in the control's label.
 */
export default function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-600 px-1 text-[10px] font-semibold leading-none text-white"
    >
      {count}
    </span>
  );
}
