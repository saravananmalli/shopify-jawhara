import type { Product } from "@/types/product";

export type CatalogSortKey =
  "RECOMMENDED" | "BEST_SELLING" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

/**
 * One Shopify Storefront `ProductFilter` input object, e.g.
 * `{ "price": { "min": 0, "max": 2000 } }` or `{ "productType": "Ring" }`.
 * Shape depends on the filter kind and is passed straight back to Shopify as
 * a GraphQL variable, so it's kept opaque here.
 */
export type ProductFilterInput = Record<string, unknown>;

export type CatalogFilterValue = {
  id: string;
  label: string;
  count: number;
  /** Canonical JSON of the ProductFilterInput this value applies. */
  input: string;
};

export type CatalogFilter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: CatalogFilterValue[];
};

export type CatalogPage = {
  collection: {
    id: string | null;
    title: string;
    handle: string;
    description: string;
  };
  products: Product[];
  filters: CatalogFilter[];
  /**
   * Exact only when Shopify can tell us (the `search` path). For a real
   * collection the Storefront API exposes no total, so this is null and the
   * UI derives it from the loaded pages.
   */
  totalCount: number | null;
  hasNextPage: boolean;
  endCursor: string | null;
  /** Sorts this data source can honour — `search` can't order by newest/best-selling. */
  supportedSorts: CatalogSortKey[];
};
