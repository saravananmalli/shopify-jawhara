import { shopifyFetch } from "@/services/shopify/client";
import { toProduct, toProductDetail } from "@/services/shopify/adapters";
import {
  PRODUCTS_BY_IDS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "@/graphql/queries";
import { PRODUCT_REVALIDATE_SECONDS } from "@/config/catalog";
import type { Product, ProductDetail } from "@/types/product";
import type { ShopifyProductCard, ShopifyProductDetail } from "@/types/shopify-api";

export async function getProducts({
  first = 12,
  sortKey = "BEST_SELLING",
  revalidate = PRODUCT_REVALIDATE_SECONDS,
}: {
  first?: number;
  sortKey?: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
  /** Override for statically generated pages that re-render on their own schedule. */
  revalidate?: number;
} = {}): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProductCard }[] };
  }>({
    query: PRODUCTS_QUERY,
    variables: { first, sortKey },
    revalidate,
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

export async function searchProducts({
  query,
  first = 8,
}: {
  query: string;
  first?: number;
}): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProductCard }[] };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query, first },
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

export async function getProductByHandle(
  handle: string
): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ShopifyProductDetail | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.product ? toProductDetail(data.product) : null;
}

/**
 * Shopify's recommendation engine returns few or none for a small or new
 * catalogue, so top the list up with best sellers (minus the current product
 * and any duplicates) rather than rendering a near-empty "You May Also Like".
 */
export async function getRelatedProducts(
  productId: string,
  { limit = 8 }: { limit?: number } = {}
): Promise<Product[]> {
  const data = await shopifyFetch<{
    productRecommendations: ShopifyProductCard[] | null;
  }>({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  const related = (data.productRecommendations ?? []).map(toProduct).slice(0, limit);
  if (related.length >= limit) return related;

  const bestSellers = await getProducts({ first: limit + related.length + 1 });
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
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const data = await shopifyFetch<{ nodes: (ShopifyProductCard | null)[] }>({
    query: PRODUCTS_BY_IDS_QUERY,
    variables: { ids },
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });

  return data.nodes.flatMap((node) => (node ? [toProduct(node)] : []));
}
