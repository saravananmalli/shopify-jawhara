import type { Metadata } from "next";
import CollectionPageView, {
  type RawSearchParams,
} from "@/components/collection/CollectionPageView";
import { getCollectionMetadata } from "@/components/collection/collection-metadata";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  return getCollectionMetadata({
    handle: ALL_PRODUCTS_HANDLE,
    rawSearchParams: await searchParams,
    canonicalPath: "/collections",
    description: (await getDictionary(await getLocale())).meta.collectionsDescription,
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
