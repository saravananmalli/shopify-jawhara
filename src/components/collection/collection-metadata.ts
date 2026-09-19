import type { Metadata } from "next";
import { ALL_PRODUCTS_HANDLE, ALL_PRODUCTS_TITLE } from "@/config/catalog";
import { getCollectionByHandle } from "@/services/shopify";
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
  const collection =
    handle === ALL_PRODUCTS_HANDLE
      ? null
      : await getCollectionByHandle(handle, { first: 1 });

  if (!collection && handle !== ALL_PRODUCTS_HANDLE) {
    return {
      title: "Collection not found | Jawhara Jewellery",
      robots: { index: false },
    };
  }

  const title = collection?.title ?? ALL_PRODUCTS_TITLE;
  const description =
    collection?.description ||
    fallbackDescription ||
    `Shop the ${title} collection at Jawhara Jewellery.`;
  const isRefined = Object.keys(rawSearchParams).length > 0;

  return {
    title: `${title} | Jawhara Jewellery`,
    description,
    // Filtered/sorted views are duplicates of the base collection.
    alternates: { canonical: canonicalPath },
    ...(isRefined && { robots: { index: false, follow: true } }),
    openGraph: {
      title: `${title} | Jawhara Jewellery`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Jawhara Jewellery`,
      description,
    },
  };
}
