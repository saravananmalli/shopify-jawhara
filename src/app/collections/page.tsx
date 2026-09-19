import type { Metadata } from "next";
import CollectionPageView, {
  type RawSearchParams,
} from "@/components/collection/CollectionPageView";
import { getCollectionMetadata } from "@/components/collection/collection-metadata";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  return getCollectionMetadata({
    handle: ALL_PRODUCTS_HANDLE,
    rawSearchParams: await searchParams,
    canonicalPath: "/collections",
    description:
      "Browse every Jawhara Jewellery piece — bridal, gold, diamonds, pearls, and more, straight from Dubai's historic Gold Souk.",
  });
}

/** The collections index is the "all products" view of the collection page. */
export default async function CollectionsIndexPage({
  searchParams,
}: PageProps) {
  return (
    <CollectionPageView
      handle={ALL_PRODUCTS_HANDLE}
      rawSearchParams={await searchParams}
    />
  );
}
