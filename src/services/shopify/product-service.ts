import { shopifyFetch } from "@/services/shopify/client";
import type { Locale } from "@/config/i18n";
import { toProduct, toProductDetail } from "@/services/shopify/adapters";
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCTS_BY_IDS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_SORTED_QUERY,
} from "@/graphql/queries";
import { PRODUCT_REVALIDATE_SECONDS } from "@/config/catalog";
import type { Product, ProductDetail } from "@/types/product";
import type { ShopifyProductCard, ShopifyProductDetail } from "@/types/shopify-api";

export async function getProducts({
  first = 12,
  sortKey = "BEST_SELLING",
  reverse = false,
  revalidate = PRODUCT_REVALIDATE_SECONDS,
  locale,
}: {
  locale: Locale;
  first?: number;
  sortKey?: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
  /** Shopify sorts CREATED_AT oldest-first; pass true for newest-first. */
  reverse?: boolean;
  /** Override for statically generated pages that re-render on their own schedule. */
  revalidate?: number;
}): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProductCard }[] };
  }>({
    query: PRODUCTS_QUERY,
    variables: { first, sortKey, reverse },
    locale,
    revalidate,
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

const MAX_SEARCH_LENGTH = 100;

/** The query is a GraphQL variable (not concatenated), but Shopify still parses
 * it as search syntax — strip the operators so shoppers can't inject field
 * filters (`tag:…`, `-vendor:…`, quoted/grouped clauses) and cap its length. */
function toSafeSearchTerm(query: string): string {
  return query
    .replace(/[:"()\\<>{}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

export async function searchProducts({
  query,
  first = 8,
  locale,
}: {
  query: string;
  first?: number;
  locale: Locale;
}): Promise<Product[]> {
  const safeQuery = toSafeSearchTerm(query);
  if (!safeQuery) return [];

  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProductCard }[] };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query: safeQuery, first },
    locale,
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

/**
 * Shopify search-syntax filter (`tag:solitaire`, `variants.price:<5000`) for
 * the homepage tabs. Unlike `searchProducts` it does NOT strip operators —
 * the query is written in code (never typed by a shopper), and stripping the
 * `:`/`<` turns a filter into a plain-text search that matches nothing.
 * Don't pass user input here.
 */
export async function filterProducts({
  query,
  first = 12,
  sort,
  revalidate = PRODUCT_REVALIDATE_SECONDS,
  locale,
}: {
  query: string;
  first?: number;
  /** Order by price across every match instead of Shopify's relevance order. */
  sort?: "price_asc" | "price_desc";
  /** Override for statically generated pages that re-render on their own schedule. */
  revalidate?: number;
  locale: Locale;
}): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProductCard }[] };
  }>({
    query: sort ? SEARCH_PRODUCTS_SORTED_QUERY : SEARCH_PRODUCTS_QUERY,
    variables: sort
      ? { query, first, sortKey: "PRICE", reverse: sort === "price_desc" }
      : { query, first },
    locale,
    revalidate,
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

/**
 * A collection's products in the order set in Shopify Admin. Returns [] when
 * the collection doesn't exist (yet) or is empty, so callers can fall back.
 */
export async function getCollectionProducts({
  handle,
  first = 12,
  revalidate = PRODUCT_REVALIDATE_SECONDS,
  locale,
}: {
  handle: string;
  locale: Locale;
  first?: number;
  /** Override for statically generated pages that re-render on their own schedule. */
  revalidate?: number;
}): Promise<Product[]> {
  const data = await shopifyFetch<{
    collection: { products: { edges: { node: ShopifyProductCard }[] } } | null;
  }>({
    query: COLLECTION_PRODUCTS_QUERY,
    variables: { handle, first },
    locale,
    revalidate,
  });

  return data.collection?.products.edges.map((edge) => toProduct(edge.node)) ?? [];
}

export async function getProductByHandle(
  handle: string,
  locale: Locale
): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ShopifyProductDetail | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    locale,
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.product ? toProductDetail(data.product, locale) : null;
}

/**
 * Shopify's recommendation engine returns few or none for a small or new
 * catalogue, so top the list up with best sellers (minus the current product
 * and any duplicates) rather than rendering a near-empty "You May Also Like".
 */
export async function getRelatedProducts(
  productId: string,
  { limit = 8, locale }: { limit?: number; locale: Locale }
): Promise<Product[]> {
  const data = await shopifyFetch<{
    productRecommendations: ShopifyProductCard[] | null;
  }>({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    locale,
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  const related = (data.productRecommendations ?? []).map(toProduct).slice(0, limit);
  if (related.length >= limit) return related;

  const bestSellers = await getProducts({ first: limit + related.length + 1, locale });
  const seen = new Set([productId, ...related.map((product) => product.id)]);
  for (const product of bestSellers) {
    if (related.length >= limit) break;
    if (!seen.has(product.id)) related.push(product);
  }
  return related;
}

/**
 * Preserves the order of `ids`; drops any that no longer exist or aren't
 * published to the Storefront API (Shopify returns null for those).
 */
export async function getProductsByIds(ids: string[], locale: Locale): Promise<Product[]> {
  if (ids.length === 0) return [];

  const data = await shopifyFetch<{ nodes: (ShopifyProductCard | null)[] }>({
    query: PRODUCTS_BY_IDS_QUERY,
    variables: { ids },
    locale,
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.nodes.flatMap((node) => (node ? [toProduct(node)] : []));
}
