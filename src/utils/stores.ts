import type { StoreLocation } from "@/types/content";

/**
 * Comparison key for country/region text edited by hand in Shopify Admin:
 * "Ras Al-Khaimah", "Ras Al Khaimah" and " ras al khaimah " are one place, and
 * must not split a filter into look-alike options.
 */
export function foldKey(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** Distinct values of a store field (first spelling wins), sorted A–Z. */
export function uniqueValues(
  stores: readonly StoreLocation[],
  field: "country" | "region",
): string[] {
  const byKey = new Map<string, string>();
  for (const store of stores) {
    const value = store[field];
    if (!value) continue;
    const key = foldKey(value);
    if (!byKey.has(key)) byKey.set(key, value);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

/** The shopper's detected location is a UAE emirate, so it can only auto-match
 * a UAE country entry ("UAE", "United Arab Emirates (UAE)", …). */
export function isUaeCountry(country: string): boolean {
  const key = foldKey(country);
  return key === "uae" || key.startsWith("unitedarabemirates");
}

/** `tel:` href from display text like "+971 4 288 1130"; null if no digits. */
export function toTelHref(phone: string): string | null {
  const dialable = phone.replace(/[^\d+]/g, "");
  return /\d/.test(dialable) ? `tel:${dialable}` : null;
}

/** Directions link: the store's own Maps link, else its coordinates. */
export function toDirectionsHref(store: StoreLocation): string | null {
  if (store.mapLink) return store.mapLink;
  if (!store.coordinates) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;
}
