"use client";

import { DirhamSymbol } from "dirham/react";
import { useLocale } from "@/store/locale";
import { formatNumber } from "@/utils/format";

/** Shared money display — the dirham glyph is only correct for AED; any
 * other market falls back to its currency code. Matches the pattern already
 * used inline on `ProductCard` and `FilterOptions`, extracted here so the
 * cart isn't the one place formatting prices as an `Intl` currency string. */
export default function Price({
  amount,
  currencyCode,
  size = "0.85em",
  className = "",
}: {
  amount: number;
  currencyCode: string;
  /** Dirham glyph size, in `em` relative to the surrounding text. */
  size?: string;
  className?: string;
}) {
  const locale = useLocale();
  return currencyCode === "AED" ? (
    <span className={`inline-flex items-center gap-0.5 rtl:flex-row-reverse ${className}`}>
      <DirhamSymbol size={size} />
      {formatNumber(amount, locale)}
    </span>
  ) : (
    <span className={className}>
      {currencyCode} {formatNumber(amount, locale)}
    </span>
  );
}
