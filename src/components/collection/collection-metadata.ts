import type { Metadata } from "next";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";
import { getDictionary } from "@/dictionaries";
import { formatMessage } from "@/utils/i18n";
import { getCollectionByHandle } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";
import { localeAlternates } from "@/utils/seo";
import type { RawSearchParams } from "@/components/collection/CollectionPageView";

export async function getCollectionMetadata({
  handle,
  rawSearchParams,
  canonicalPath,
  description: fallbackDescription,
}: {
  handle: string;
  rawSearchParams: RawSearchParams;
  canonicalPath: string;
  description?: string;
}): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  const collection =
    handle === ALL_PRODUCTS_HANDLE
      ? null
      : await getCollectionByHandle(handle, locale);

  if (!collection && handle !== ALL_PRODUCTS_HANDLE) {
    return {
      title: `${meta.collectionNotFound} | ${meta.brand}`,
      robots: { index: false },
    };
  }

  const title = collection?.title ?? meta.allJewellery;
  const description =
    collection?.description ||
    fallbackDescription ||
    formatMessage(meta.collectionDescriptionFallback, { title, brand: meta.brand });
  const isRefined = Object.keys(rawSearchParams).length > 0;

  return {
    title: `${title} | ${meta.brand}`,
    description,
    // Filtered/sorted views are duplicates of the base collection.
    alternates: localeAlternates(canonicalPath, locale),
    ...(isRefined && { robots: { index: false, follow: true } }),
    openGraph: {
      title: `${title} | ${meta.brand}`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${meta.brand}`,
      description,
    },
  };
}
