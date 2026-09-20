import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/config/i18n";
import { localizePath } from "@/utils/locale-path";

/** Canonical + `hreflang` alternates for one page. `path` is the unprefixed
 * English path (`/products/x`, `/` for home). Search engines need both the
 * self-reference and the sibling languages, plus `x-default` for everyone
 * else, or they treat the two languages as duplicate content. */
export function localeAlternates(path: string, locale: Locale): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizePath(path, l)])),
      "x-default": localizePath(path, defaultLocale),
    },
  };
}
