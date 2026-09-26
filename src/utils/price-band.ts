import { PRICE_BANDS } from "@/config/catalog";

export type Band = { min?: number; max?: number };

/** Min inclusive, max exclusive — the same rule as the price filter. */
export const inBand = (amount: number, band: Band) =>
  amount >= (band.min ?? 0) && amount < (band.max ?? Infinity);

/**
 * The price band a "shop by price" collection stands for, from its handle
 * ("under-1000", "1000-2500", "above-10000" — one per PRICE_BANDS entry), or
 * null for any other collection. Those Shopify collections match a product when
 * ANY of its variants is in the band, so their cards need the band to show
 * the variant that got them in.
 */
export function priceBandOfHandle(handle: string): Band | null {
  return (
    PRICE_BANDS.find((band) => {
      if (band.min === undefined) return handle === `under-${band.max}`;
      if (band.max === undefined) return handle === `above-${band.min}`;
      return handle === `${band.min}-${band.max}`;
    }) ?? null
  );
}
