import { defaultLocale, isLocale, type Locale } from "@/config/i18n";

// Pure string helpers (no React/Next imports) so the proxy, server components
// and client components can all share them.

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Prefixes an internal absolute path with the locale, leaving the default
 * locale, external URLs, `mailto:`/`tel:` and hash-only links untouched. */
export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale || EXTERNAL.test(path) || !path.startsWith("/")) return path;
  const { locale: existing } = splitLocale(path);
  if (existing) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Splits `/ar/products/x?y=1` into the locale prefix (if any) and the rest. */
export function splitLocale(path: string): { locale: Locale | null; rest: string } {
  const match = path.match(/^\/([^/?#]+)(.*)$/);
  if (!match || !isLocale(match[1])) return { locale: null, rest: path };
  const rest = match[2];
  return { locale: match[1], rest: rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}` };
}

/** Same page, other locale — used by the language switcher. */
export function switchLocalePath(path: string, to: Locale): string {
  const { rest } = splitLocale(path);
  return localizePath(rest, to);
}
