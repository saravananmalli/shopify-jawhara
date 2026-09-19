import { shopifyFetch } from "@/services/shopify/client";
import { toProduct, toProductDetail } from "@/services/shopify/adapters";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "@/graphql/queries";
import type { Product, ProductDetail } from "@/types/product";
import type { ShopifyProduct, ShopifyProductDetail } from "@/types/shopify-api";

export async function getProducts({
  first = 12,
  sortKey = "BEST_SELLING",
}: {
  first?: number;
  sortKey?: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
} = {}): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>({
    query: PRODUCTS_QUERY,
    variables: { first, sortKey },
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
    products: { edges: { node: ShopifyProduct }[] };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query, first },
  });

  return data.products.edges.map((edge) => toProduct(edge.node));
}

export async function getProductByHandle(
  handle: string
): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ShopifyProductDetail | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });

  return data.product ? toProductDetail(data.product) : null;
}
