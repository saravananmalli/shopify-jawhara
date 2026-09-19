import { shopifyFetch } from "@/services/shopify/client";
import {
  sortByDisplayOrder,
  sortOccasionsByDisplayOrder,
  sortTestimonialsByDisplayOrder,
  toBrand,
  toCategoryTile,
  toCollection,
  toHeroBanner,
  toNavLinks,
  toOccasion,
  toSitemapEntry,
  toTestimonial,
} from "@/services/shopify/adapters";
import {
  BRAND_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  HERO_BANNERS_QUERY,
  MENU_QUERY,
  OCCASIONS_QUERY,
  SITEMAP_QUERY,
  TESTIMONIALS_QUERY,
} from "@/graphql/queries";
import type {
  Brand,
  CategoryTile,
  Collection,
  HeroBanner,
  NavLink,
  Occasion,
  SitemapEntry,
  Testimonial,
} from "@/types/content";
import type {
  ShopifyBrand,
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyHeroBannerMetaobject,
  ShopifyMenuItem,
  ShopifyOccasionMetaobject,
  ShopifySitemapNode,
  ShopifyTestimonialMetaobject,
} from "@/types/shopify-api";

const CONTENT_REVALIDATE_SECONDS = 3600; // stable content — rule #22

export async function getBrand(): Promise<Brand> {
  const data = await shopifyFetch<{
    shop: { name: string; brand: ShopifyBrand | null };
  }>({
    query: BRAND_QUERY,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return toBrand(data.shop.name, data.shop.brand);
}

/**
 * Returns [] (not an error) when the menu handle doesn't exist yet — lets
 * callers fall back to a default nav instead of breaking the header.
 */
export async function getMenu(handle: string): Promise<NavLink[]> {
  const data = await shopifyFetch<{
    menu: { items: ShopifyMenuItem[] } | null;
  }>({
    query: MENU_QUERY,
    variables: { handle },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return data.menu ? toNavLinks(data.menu.items) : [];
}

export async function getCategoryCollections({
  first = 8,
}: { first?: number } = {}): Promise<CategoryTile[]> {
  const data = await shopifyFetch<{
    collections: { edges: { node: ShopifyCollection }[] };
  }>({
    query: COLLECTIONS_QUERY,
    variables: { first },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return data.collections.edges.map((edge) => toCategoryTile(edge.node));
}

/**
 * Returns null when no collection has that handle (deleted, unpublished, or
 * a stale link in the Shopify nav menu) — callers should render a real
 * not-found state, not fall back to fake data.
 */
export async function getCollectionByHandle(
  handle: string,
  { first = 24 }: { first?: number } = {}
): Promise<Collection | null> {
  const data = await shopifyFetch<{
    collection: ShopifyCollectionWithProducts | null;
  }>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, first },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return data.collection ? toCollection(data.collection) : null;
}

/**
 * Fetches several collections by handle in parallel, dropping any that
 * don't exist (deleted/renamed/not-yet-created) rather than throwing —
 * used for curated tile grids (e.g. nav category tiles, homepage "Shop By
 * Category") where the exact set of real Shopify collections is known.
 */
export async function getCollectionsByHandles(
  handles: string[],
  { first = 1 }: { first?: number } = {}
): Promise<Collection[]> {
  const collections = await Promise.all(
    handles.map((handle) => getCollectionByHandle(handle, { first }))
  );
  return collections.filter((collection): collection is Collection => collection !== null);
}

/**
 * Returns [] when the `hero_banner` metaobject definition hasn't been
 * created in Shopify Admin yet, rather than throwing.
 */
export async function getHeroBanners({
  first = 5,
}: { first?: number } = {}): Promise<HeroBanner[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyHeroBannerMetaobject }[] };
  }>({
    query: HERO_BANNERS_QUERY,
    variables: { first },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges.map((edge) => edge.node);
  return sortByDisplayOrder(nodes).map(toHeroBanner);
}

/**
 * Returns [] when the `occasion` metaobject definition hasn't been created
 * yet, or nothing is marked Active — the homepage section renders nothing
 * in that case rather than showing fake occasions.
 */
export async function getOccasions({
  first = 10,
}: { first?: number } = {}): Promise<Occasion[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyOccasionMetaobject }[] };
  }>({
    query: OCCASIONS_QUERY,
    variables: { first },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges
    .map((edge) => edge.node)
    .filter((node) => node.active?.value === "true");
  return sortOccasionsByDisplayOrder(nodes).map(toOccasion);
}

/**
 * Returns [] when the `testimonial` metaobject definition hasn't been created
 * yet, or nothing is marked Active — the homepage section renders nothing in
 * that case rather than showing fake reviews.
 */
export async function getTestimonials({
  first = 6,
}: { first?: number } = {}): Promise<Testimonial[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyTestimonialMetaobject }[] };
  }>({
    query: TESTIMONIALS_QUERY,
    variables: { first },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges
    .map((edge) => edge.node)
    .filter((node) => node.active?.value === "true" && node.quote?.value);
  return sortTestimonialsByDisplayOrder(nodes).map(toTestimonial);
}

/** Storefront API caps a page at 250; a catalogue past that needs pagination. */
export async function getSitemapEntries(): Promise<{
  products: SitemapEntry[];
  collections: SitemapEntry[];
}> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifySitemapNode }[] };
    collections: { edges: { node: ShopifySitemapNode }[] };
  }>({
    query: SITEMAP_QUERY,
    variables: { first: 250 },
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return {
    products: data.products.edges.map((edge) => toSitemapEntry(edge.node)),
    collections: data.collections.edges.map((edge) => toSitemapEntry(edge.node)),
  };
}
