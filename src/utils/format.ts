import { defaultLocale, type Locale } from "@/config/i18n";

/** Intl locale tags per site language. Arabic is pinned to Latin digits
 * (`-u-nu-latn`): prices, sizes and phone numbers read the same in both
 * languages and match Shopify's checkout, instead of switching to
 * Arabic-Indic numerals halfway through a purchase. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-AE",
  ar: "ar-AE-u-nu-latn",
};

/** Explicit locale on purpose: a bare `toLocaleString()` uses the visitor's
 * browser locale, which would render Arabic-Indic digits on some devices and
 * mismatch the server-rendered HTML. */
export function formatNumber(value: number, locale: Locale = defaultLocale) {
  return value.toLocaleString(INTL_LOCALE[locale]);
}

export function formatMoney(
  amount: number,
  currencyCode: string,
  locale: Locale = defaultLocale
) {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
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

const METAFIELD_UNITS: Record<Locale, Record<string, string>> = {
  en: {
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
  },
  ar: {
    GRAMS: "غ",
    KILOGRAMS: "كغ",
    MILLIGRAMS: "ملغ",
    OUNCES: "أونصة",
    POUNDS: "رطل",
    MILLIMETERS: "مم",
    CENTIMETERS: "سم",
    METERS: "م",
    INCHES: "بوصة",
    FEET: "قدم",
  },
};

const YES_NO: Record<Locale, [string, string]> = { en: ["Yes", "No"], ar: ["نعم", "لا"] };

/**
 * Shopify returns non-text metafields as raw strings — weight/dimension come
 * back as JSON (`{"value":22.63,"unit":"GRAMS"}`), lists as a JSON array, and
 * booleans as "true"/"false". Text-like types pass through unchanged.
 */
export function formatMetafieldValue(
  type: string,
  value: string,
  locale: Locale = defaultLocale
): string {
  try {
    if (type === "weight" || type === "dimension" || type === "volume") {
      const { value: amount, unit } = JSON.parse(value) as { value: number; unit: string };
      return `${amount} ${METAFIELD_UNITS[locale][unit] ?? unit.toLowerCase()}`;
    }
    if (type.startsWith("list.")) {
      const items = JSON.parse(value) as unknown[];
      return items.map(String).join(", ");
    }
  } catch {
    return value;
  }
  if (type === "boolean") return YES_NO[locale][value === "true" ? 0 : 1];
  return value;
}
