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

const METAFIELD_UNITS: Record<string, string> = {
  GRAMS: "g",
  KILOGRAMS: "kg",
  MILLIGRAMS: "mg",
  OUNCES: "oz",
  POUNDS: "lb",
  MILLIMETERS: "mm",
  CENTIMETERS: "cm",
  METERS: "m",
  INCHES: "in",
  FEET: "ft",
};

/**
 * Shopify returns non-text metafields as raw strings — weight/dimension come
 * back as JSON (`{"value":22.63,"unit":"GRAMS"}`), lists as a JSON array, and
 * booleans as "true"/"false". Text-like types pass through unchanged.
 */
export function formatMetafieldValue(type: string, value: string): string {
  try {
    if (type === "weight" || type === "dimension" || type === "volume") {
      const { value: amount, unit } = JSON.parse(value) as { value: number; unit: string };
      return `${amount} ${METAFIELD_UNITS[unit] ?? unit.toLowerCase()}`;
    }
    if (type.startsWith("list.")) {
      const items = JSON.parse(value) as unknown[];
      return items.map(String).join(", ");
    }
  } catch {
    return value;
  }
  if (type === "boolean") return value === "true" ? "Yes" : "No";
  return value;
}
