import type { Metadata } from "next";
import CollectionPageView, {
  type RawSearchParams,
} from "@/components/collection/CollectionPageView";
import { getCollectionMetadata } from "@/components/collection/collection-metadata";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ handle }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  return getCollectionMetadata({
    handle,
    rawSearchParams,
    canonicalPath: `/collections/${handle}`,
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const [{ handle }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  return (
    <CollectionPageView handle={handle} rawSearchParams={rawSearchParams} />
  );
}
