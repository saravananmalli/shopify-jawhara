"use client";

import Image from "next/image";
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
export default function LanguageSwitcher({
  className = "",
  showFlag = false,
}: {
  className?: string;
  /** UAE flag before the Arabic label (only ever shown next to "العربية"). */
  showFlag?: boolean;
}) {
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
      {showFlag && target === "ar" && (
        <Image src="/brand/icons/nav/uae.webp" alt="" width={24} height={24} className="h-6 w-6" />
      )}
      {localeConfig[target].label}
    </a>
  );
}
