export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

/** English keeps its original, unprefixed URLs (`/products/x`); every other
 * locale lives under its own prefix (`/ar/products/x`). Existing links and
 * search rankings for the English site are untouched. */
export const defaultLocale: Locale = "en";

/** Set by the language switcher so the proxy can send a returning visitor to
 * the language they chose. */
export const LOCALE_COOKIE = "jawhara_locale";

export const localeConfig = {
  en: {
    dir: "ltr",
    label: "English",
    /** Shopify Storefront API `LanguageCode` for `@inContext`. */
    shopifyLanguage: "EN",
    ogLocale: "en_AE",
  },
  ar: {
    dir: "rtl",
    label: "العربية",
    shopifyLanguage: "AR",
    ogLocale: "ar_AE",
  },
} as const satisfies Record<
  Locale,
  { dir: "ltr" | "rtl"; label: string; shopifyLanguage: string; ogLocale: string }
>;

export type Direction = (typeof localeConfig)[Locale]["dir"];

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}
