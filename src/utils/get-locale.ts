import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "@/config/i18n";

/** The locale from the `/[lang]` URL segment, for any Server Component,
 * layout, `generateMetadata` or server utility — no prop drilling. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}
