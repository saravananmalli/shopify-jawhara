import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales, type Locale } from "@/config/i18n";

/** Best supported locale from `Accept-Language`, or null when the browser
 * prefers something we don't translate. */
function preferredLocale(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { language: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find(({ language }) => isLocale(language))?.language as Locale | null ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefixed = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (prefixed === defaultLocale) {
    // `/en/products/x` and `/products/x` are the same page — keep one URL.
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (prefixed) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const wanted = isLocale(saved)
    ? saved
    : // First visit only, and only on the homepage: deep links people share
      // shouldn't change language under them.
      pathname === "/"
      ? preferredLocale(request.headers.get("accept-language"))
      : null;

  const url = request.nextUrl.clone();
  if (wanted && wanted !== defaultLocale) {
    url.pathname = `/${wanted}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension
  // (favicon, robots.txt, sitemap.xml, images).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
