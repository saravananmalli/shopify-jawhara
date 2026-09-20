"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, localeConfig, type Locale } from "@/config/i18n";
import { useDictionary, useLocale } from "@/store/locale";
import { switchLocalePath } from "@/utils/locale-path";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** English | العربية toggle. The link is a real, crawlable `<a>` to the same
 * page in the other language; the click additionally remembers the choice so
 * the proxy sends the shopper back to it on their next visit.
 *
 * Switching is a client-side navigation — no document reload. `<html lang
 * dir>` is rendered by the root layout from the URL's `[lang]` param, so the
 * direction, font and every server-rendered string change together. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { common } = useDictionary();

  const target: Locale = locale === "ar" ? "en" : "ar";
  const href = switchLocalePath(pathname, target);

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={common.switchLanguage}
      onClick={(event) => {
        event.preventDefault();
        try {
          document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
        } catch {
          // Cookies blocked — the switch still works, it just isn't remembered.
        }
        router.push(`${href}${window.location.search}${window.location.hash}`);
      }}
      className={className}
    >
      {localeConfig[target].label}
    </a>
  );
}
