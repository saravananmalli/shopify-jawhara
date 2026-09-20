import { SORT_OPTION_KEYS } from "@/config/catalog";
import type { CatalogSortKey, ProductFilterInput } from "@/types/catalog";

const DEFAULT_SORT: CatalogSortKey = "RECOMMENDED";
const MAX_FILTERS = 20;
const MAX_FILTER_LENGTH = 500;

/** Keys of Shopify's Storefront `ProductFilter` input — anything else in the
 * URL is dropped before it reaches the API. */
const ALLOWED_FILTER_KEYS = new Set([
  "available",
  "price",
  "productType",
  "productVendor",
  "tag",
  "variantOption",
  "productMetafield",
  "variantMetafield",
  "taxonomyMetafield",
  "category",
  // Not Shopify inputs — resolved by our own server-side filtering.
  "priceBand",
  "deals",
  "inCollection",
]);

const isAmount = (value: unknown) =>
  value === undefined ||
  (typeof value === "number" && Number.isFinite(value) && value >= 0);

function hasValidCustomShapes(parsed: Record<string, unknown>): boolean {
  if ("priceBand" in parsed) {
    const band = parsed.priceBand as { min?: unknown; max?: unknown } | null;
    if (
      !band ||
      typeof band !== "object" ||
      !isAmount(band.min) ||
      !isAmount(band.max)
    ) {
      return false;
    }
  }
  if ("inCollection" in parsed) {
    const handle = parsed.inCollection;
    if (typeof handle !== "string" || !/^[a-z0-9-]{1,100}$/i.test(handle))
      return false;
  }
  return !("deals" in parsed) || parsed.deals === true;
}

export type CatalogQueryState = {
  sort: CatalogSortKey;
  /** Canonical JSON strings, one per applied ProductFilterInput. */
  filters: string[];
};

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Stable form so the same filter compares equal however it was produced. */
export function canonicalizeFilter(raw: string): string | null {
  if (raw.length > MAX_FILTER_LENGTH) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    const keys = Object.keys(parsed);
    if (keys.length === 0 || !keys.every((key) => ALLOWED_FILTER_KEYS.has(key)))
      return null;
    if (!hasValidCustomShapes(parsed as Record<string, unknown>)) return null;
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

export function parseCatalogSearchParams(
  params: RawSearchParams,
): CatalogQueryState {
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort =
    SORT_OPTION_KEYS.find((key) => key === sortParam) ??
    DEFAULT_SORT;

  const rawFilters = params.filter === undefined ? [] : [params.filter].flat();
  const filters = rawFilters.slice(0, MAX_FILTERS).flatMap((raw) => {
    const canonical = canonicalizeFilter(raw);
    return canonical ? [canonical] : [];
  });

  return { sort, filters: [...new Set(filters)] };
}

export function buildCatalogQueryString({
  sort,
  filters,
}: CatalogQueryState): string {
  const params = new URLSearchParams();
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  for (const filter of filters) params.append("filter", filter);
  return params.toString();
}

export function toProductFilterInputs(filters: string[]): ProductFilterInput[] {
  return filters.map((filter) => JSON.parse(filter) as ProductFilterInput);
}

export const inCollectionInput = (handle: string) =>
  JSON.stringify({ inCollection: handle });

export const isInCollectionFilter = (filter: string) =>
  "inCollection" in JSON.parse(filter);
