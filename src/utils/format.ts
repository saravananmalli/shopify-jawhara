export function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * True per-word title case ("GOLD" -> "Gold", "NEW ARRIVALS" -> "New
 * Arrivals") — CSS's `capitalize` only uppercases each word's first letter
 * without lowercasing the rest, so it can't fix an all-caps Shopify title.
 */
export function toTitleCase(text: string) {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
