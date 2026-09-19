import { shopifyFetch } from "@/services/shopify/client";
import { getProductsByIds } from "@/services/shopify/product-service";
import {
  COLLECTION_SORTS,
  SEARCH_SORTS,
  toCatalogFilters,
  toCatalogPageFromCollection,
  toCatalogPageFromSearch,
} from "@/services/shopify/adapters";
import {
  CATALOG_COLLECTION_QUERY,
  CATALOG_SEARCH_QUERY,
  CATALOG_TAG_SCAN_COLLECTION_QUERY,
  CATALOG_TAG_SCAN_SEARCH_QUERY,
} from "@/graphql/queries";
import {
  ALL_PRODUCTS_HANDLE,
  ALL_PRODUCTS_TITLE,
  CATALOG_PAGE_SIZE,
} from "@/config/catalog";
import { toProductFilterInputs } from "@/utils/catalog-params";
import {
  buildTagGroupFilters,
  matchesTagGroups,
  refOfTag,
} from "@/utils/tag-filters";
import type { CategoryTile } from "@/types/content";
import type {
  CatalogFilter,
  CatalogPage,
  CatalogSortKey,
} from "@/types/catalog";
import type {
  ShopifyCatalogCollection,
  ShopifyCatalogSearch,
  ShopifyFilter,
  ShopifyTagScanCollection,
  ShopifyTagScanSearch,
} from "@/types/shopify-api";

const COLLECTION_SORT: Record<
  CatalogSortKey,
  { sortKey: string; reverse: boolean }
> = {
  RECOMMENDED: { sortKey: "COLLECTION_DEFAULT", reverse: false },
  BEST_SELLING: { sortKey: "BEST_SELLING", reverse: false },
  // Shopify's CREATED key is oldest-first.
  NEWEST: { sortKey: "CREATED", reverse: true },
  PRICE_ASC: { sortKey: "PRICE", reverse: false },
  PRICE_DESC: { sortKey: "PRICE", reverse: true },
};

/** `search` only orders by relevance or price; other keys degrade to relevance. */
const SEARCH_SORT: Record<
  CatalogSortKey,
  { sortKey: string; reverse: boolean }
> = {
  RECOMMENDED: { sortKey: "RELEVANCE", reverse: false },
  BEST_SELLING: { sortKey: "RELEVANCE", reverse: false },
  NEWEST: { sortKey: "RELEVANCE", reverse: false },
  PRICE_ASC: { sortKey: "PRICE", reverse: false },
  PRICE_DESC: { sortKey: "PRICE", reverse: true },
};

/**
 * One page of a collection's products, with real Shopify facets and paging.
 * Returns null for an unknown collection handle — except "all", which has no
 * Storefront collection and is served from `search` so the catch-all page
 * still works. Not cached: availability and price must stay fresh.
 */
export async function getCatalogPage(
  args: Parameters<typeof getCatalogPageCore>[0],
): Promise<CatalogPage | null> {
  // Tag-group facets (Metal, Stone, ...) come from our own scan, so they run
  // alongside the main request — and only when facets are wanted at all.
  const [page, tagFilters] = await Promise.all([
    getCatalogPageCore(args),
    args.withFilters === false
      ? Promise.resolve([])
      : getTagGroupFilters(args.handle),
  ]);
  return page && { ...page, filters: [...tagFilters, ...page.filters] };
}

async function getCatalogPageCore({
  handle,
  filters = [],
  sort = "RECOMMENDED",
  after = null,
  first = CATALOG_PAGE_SIZE,
  withFilters = true,
}: {
  handle: string;
  /** Canonical filter JSON strings — see utils/catalog-params.ts. */
  filters?: string[];
  sort?: CatalogSortKey;
  after?: string | null;
  first?: number;
  withFilters?: boolean;
}): Promise<CatalogPage | null> {
  const custom = splitCustomFilters(filters);
  if (hasCustomFilters(custom)) {
    return getCustomFilteredCatalogPage({
      handle,
      custom,
      sort,
      offset: Number.parseInt(after ?? "0", 10) || 0,
      first,
      withFilters,
    });
  }

  const filterInputs = toProductFilterInputs(filters);

  const data = await shopifyFetch<{
    collection: ShopifyCatalogCollection | null;
  }>({
    query: CATALOG_COLLECTION_QUERY,
    variables: {
      handle,
      first,
      after,
      filters: filterInputs,
      withFilters,
      ...COLLECTION_SORT[sort],
    },
  });

  if (data.collection) return toCatalogPageFromCollection(data.collection);
  if (handle !== ALL_PRODUCTS_HANDLE) return null;

  const search = await shopifyFetch<{ search: ShopifyCatalogSearch }>({
    query: CATALOG_SEARCH_QUERY,
    variables: {
      first,
      after,
      filters: filterInputs,
      withFilters,
      ...SEARCH_SORT[sort],
    },
  });

  return toCatalogPageFromSearch(search.search, {
    title: ALL_PRODUCTS_TITLE,
    handle: ALL_PRODUCTS_HANDLE,
  });
}

type ScanNode = {
  id: string;
  tags: string[];
  collections: { nodes: { handle: string }[] };
  priceRange: { minVariantPrice: { amount: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string } };
};

type CustomFilters = {
  /** A product must carry ANY value of EVERY group. Plain tags with no filter
   * group (the quick chips) share the group "". */
  tagGroups: { group: string; keys: Set<string> }[];
  /** Match ANY band: min inclusive, max exclusive. */
  bands: { min?: number; max?: number }[];
  onSale: boolean;
  /** Match ANY collection handle (used by the curation category tiles). */
  inCollections: string[];
  /** Everything Shopify can filter natively. */
  rest: string[];
};

/**
 * Shopify ignores `tag` inside the `filters` argument and has no multi-range
 * price or on-sale filter, so those inputs are peeled off here and applied by
 * our own scan; everything else still goes to Shopify. Groups combine with
 * AND, values inside a group with OR.
 */
function splitCustomFilters(filters: string[]): CustomFilters {
  const custom: CustomFilters = {
    tagGroups: [],
    bands: [],
    onSale: false,
    inCollections: [],
    rest: [],
  };
  const tagGroups = new Map<string, Set<string>>();
  for (const filter of filters) {
    const parsed = JSON.parse(filter) as Record<string, unknown>;
    const isSingleKey = Object.keys(parsed).length === 1;
    if (isSingleKey && typeof parsed.tag === "string") {
      const ref = refOfTag(parsed.tag);
      tagGroups.set(
        ref.group,
        (tagGroups.get(ref.group) ?? new Set()).add(ref.key),
      );
    } else if (isSingleKey && parsed.priceBand) {
      custom.bands.push(parsed.priceBand as { min?: number; max?: number });
    } else if (isSingleKey && typeof parsed.inCollection === "string") {
      custom.inCollections.push(parsed.inCollection);
    } else if (isSingleKey && parsed.deals === true) {
      custom.onSale = true;
    } else {
      custom.rest.push(filter);
    }
  }
  custom.tagGroups = [...tagGroups].map(([group, keys]) => ({ group, keys }));
  return custom;
}

const hasCustomFilters = (custom: CustomFilters) =>
  custom.tagGroups.length > 0 ||
  custom.bands.length > 0 ||
  custom.onSale ||
  custom.inCollections.length > 0;

function matchesCustomFilters(node: ScanNode, custom: CustomFilters): boolean {
  if (!matchesTagGroups(node.tags, custom.tagGroups)) return false;

  if (
    custom.inCollections.length > 0 &&
    !node.collections.nodes.some((collection) =>
      custom.inCollections.includes(collection.handle),
    )
  ) {
    return false;
  }

  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  if (
    custom.bands.length > 0 &&
    !custom.bands.some(
      (band) => price >= (band.min ?? 0) && price < (band.max ?? Infinity),
    )
  ) {
    return false;
  }

  // Same rule as the product card: compare-at only counts when above price.
  return (
    !custom.onSale ||
    parseFloat(node.compareAtPriceRange.minVariantPrice.amount) > price
  );
}

const SCAN_PAGE_SIZE = 250;
/** Bounds the scan to 1,000 products; past that the total is reported as unknown. */
const MAX_SCAN_PAGES = 4;

type ScanPage = {
  collection: CatalogPage["collection"];
  facets: ShopifyFilter[] | undefined;
  nodes: ScanNode[];
  hasNextPage: boolean;
  endCursor: string | null;
};

function isScannedProduct(
  node: ShopifyTagScanSearch["nodes"][number],
): node is ScanNode {
  return "id" in node;
}

async function scanPage({
  handle,
  useSearch,
  sort,
  variables,
  revalidate,
}: {
  handle: string;
  useSearch: boolean;
  sort: CatalogSortKey;
  variables: Record<string, unknown>;
  revalidate?: number;
}): Promise<ScanPage | null> {
  if (useSearch) {
    const { search } = await shopifyFetch<{ search: ShopifyTagScanSearch }>({
      query: CATALOG_TAG_SCAN_SEARCH_QUERY,
      variables: { ...variables, ...SEARCH_SORT[sort] },
      revalidate,
    });
    return {
      collection: {
        id: null,
        title: ALL_PRODUCTS_TITLE,
        handle: ALL_PRODUCTS_HANDLE,
        description: "",
      },
      facets: search.productFilters,
      nodes: search.nodes.filter(isScannedProduct),
      hasNextPage: search.pageInfo.hasNextPage,
      endCursor: search.pageInfo.endCursor,
    };
  }

  const { collection } = await shopifyFetch<{
    collection: ShopifyTagScanCollection | null;
  }>({
    query: CATALOG_TAG_SCAN_COLLECTION_QUERY,
    variables: { handle, ...variables, ...COLLECTION_SORT[sort] },
    revalidate,
  });
  if (!collection) return null;

  return {
    collection: {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description,
    },
    facets: collection.products.filters,
    nodes: collection.products.nodes,
    hasNextPage: collection.products.pageInfo.hasNextPage,
    endCursor: collection.products.pageInfo.endCursor,
  };
}

/**
 * Reads every product's light payload (id, tags, prices) for a collection —
 * or for `search` when it's the catch-all "all" — in pages of 250, capped at
 * MAX_SCAN_PAGES. Null when the collection doesn't exist.
 */
async function scanAll({
  handle,
  filters,
  sort,
  withFilters,
  revalidate,
}: {
  handle: string;
  filters: unknown[];
  sort: CatalogSortKey;
  withFilters: boolean;
  revalidate?: number;
}) {
  const nodes: ScanNode[] = [];
  let useSearch = false;
  let firstScan: ScanPage | null = null;
  let cursor: string | null = null;
  let truncated = false;

  for (let page = 0; page < MAX_SCAN_PAGES; page++) {
    const variables = {
      first: SCAN_PAGE_SIZE,
      after: cursor,
      filters,
      withFilters: withFilters && page === 0,
    };
    let result = await scanPage({
      handle,
      useSearch,
      sort,
      variables,
      revalidate,
    });
    if (!result && page === 0 && handle === ALL_PRODUCTS_HANDLE) {
      useSearch = true;
      result = await scanPage({
        handle,
        useSearch,
        sort,
        variables,
        revalidate,
      });
    }
    if (!result) return null;

    firstScan ??= result;
    nodes.push(...result.nodes);

    truncated = result.hasNextPage;
    if (!result.hasNextPage) break;
    cursor = result.endCursor;
  }

  return { first: firstScan!, nodes, truncated, useSearch };
}

/** Facets are counts over the whole collection, so a short cache is fine
 * (unlike stock/price, which are never cached). */
const TAG_FACET_REVALIDATE_SECONDS = 300;

/** Sections for TAG_FILTER_GROUPS, discovered from the collection's tags. */
async function getTagGroupFilters(handle: string): Promise<CatalogFilter[]> {
  const scan = await scanAll({
    handle,
    filters: [],
    sort: "RECOMMENDED",
    withFilters: false,
    revalidate: TAG_FACET_REVALIDATE_SECONDS,
  });
  if (!scan) return [];

  return buildTagGroupFilters(scan.nodes.map((node) => node.tags));
}

/**
 * Page filtered by our own inputs (tags, price bands, on-sale). Scans the
 * whole (natively filtered, sorted) collection, keeps the matches, then
 * loads full data for just the requested slice. `after` is an offset into
 * the matches here, not a Shopify cursor — the caller passes back whatever
 * `endCursor` this returned.
 */
async function getCustomFilteredCatalogPage({
  handle,
  custom,
  sort,
  offset,
  first,
  withFilters,
}: {
  handle: string;
  custom: CustomFilters;
  sort: CatalogSortKey;
  offset: number;
  first: number;
  withFilters: boolean;
}): Promise<CatalogPage | null> {
  const scan = await scanAll({
    handle,
    filters: toProductFilterInputs(custom.rest),
    sort,
    withFilters,
  });
  if (!scan) return null;

  const matchedIds = scan.nodes
    .filter((node) => matchesCustomFilters(node, custom))
    .map((node) => node.id);

  const products = await getProductsByIds(
    matchedIds.slice(offset, offset + first),
  );

  return {
    collection: scan.first.collection,
    products,
    filters: toCatalogFilters(scan.first.facets),
    totalCount: scan.truncated ? null : matchedIds.length,
    hasNextPage: offset + first < matchedIds.length,
    endCursor: String(offset + first),
    supportedSorts: scan.useSearch ? SEARCH_SORTS : COLLECTION_SORTS,
  };
}

/**
 * Keeps only the category tiles that have products in `handle`, with the
 * number of products in each. One cached scan of the collection reads every
 * product's collection memberships, so this never lists an empty category.
 */
export async function withCategoryCounts(
  handle: string,
  tiles: CategoryTile[],
): Promise<CategoryTile[]> {
  const scan = await scanAll({
    handle,
    filters: [],
    sort: "RECOMMENDED",
    withFilters: false,
    revalidate: TAG_FACET_REVALIDATE_SECONDS,
  });
  if (!scan) return [];

  return tiles.flatMap((tile) => {
    const count = scan.nodes.filter((node) =>
      node.collections.nodes.some(
        (collection) => collection.handle === tile.handle,
      ),
    ).length;
    return count > 0 ? [{ ...tile, count }] : [];
  });
}
