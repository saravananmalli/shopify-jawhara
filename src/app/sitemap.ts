import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/config/i18n";
import { siteUrl } from "@/config/site";
import { getSitemapEntries } from "@/services/shopify";
import { localizePath } from "@/utils/locale-path";

type Entry = MetadataRoute.Sitemap[number];

// One entry per language, each listing every language version (itself
// included) so search engines pair the English and Arabic pages.
function localised(path: string, extra: Omit<Entry, "url" | "alternates">): Entry[] {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${siteUrl}${localizePath(path, locale)}`])
  );
  return locales.map((locale) => ({
    url: languages[locale],
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Handles are language-independent, so one fetch covers both languages.
  const { products, collections } = await getSitemapEntries(defaultLocale);
  const toDate = (updatedAt: string | null) => (updatedAt ? new Date(updatedAt) : undefined);

  return [
    ...localised("/", { changeFrequency: "daily", priority: 1 }),
    ...localised("/collections", { changeFrequency: "weekly", priority: 0.8 }),
    ...localised("/stores", { changeFrequency: "monthly", priority: 0.5 }),
    ...localised("/customer-service", { changeFrequency: "yearly", priority: 0.4 }),
    ...localised("/pages/heritage-since-1907", { changeFrequency: "yearly", priority: 0.4 }),
    ...collections.flatMap((collection) =>
      localised(`/collections/${collection.handle}`, {
        lastModified: toDate(collection.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    ),
    ...products.flatMap((product) =>
      localised(`/products/${product.handle}`, {
        lastModified: toDate(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    ),
  ];
}
