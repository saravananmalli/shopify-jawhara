import { PRICE_BANDS, type PriceBand } from "@/config/catalog";
import type { Dictionary } from "@/dictionaries";
import type { CatalogFilter } from "@/types/catalog";

/** One collapsible group in the filters UI. `list` sections are Shopify
 * facets (whatever Search & Discovery returns); `price` and `deals` are
 * built here because Shopify has no equivalent. `category` is also built
 * here: on a page (Rings, Birthday, Wedding…) whose top strip links to
 * sibling collection pages instead of filtering the current one, the
 * Category section mirrors those same tiles — the current page always
 * checked and locked, every sibling a real checkbox that pulls that whole
 * collection's products into this page's grid (combined, not intersected —
 * see `unionCollections` in catalog-service.ts). The top strip itself stays
 * single-select navigation; this multi-select only applies inside the
 * filters popup. */
export type FilterSection = {
  key: string;
  label: string;
  kind: "list" | "price" | "deals" | "category";
  filter?: CatalogFilter;
  categoryLinks?: { id: string; label: string; input: string; current: boolean }[];
};

/** Shopify's built-in stock facet — deliberately not offered as a filter here. */
const AVAILABILITY_FILTER_ID = "filter.v.availability";

export const bandInput = (band: PriceBand) =>
  JSON.stringify({
    priceBand: {
      ...(band.min !== undefined && { min: band.min }),
      ...(band.max !== undefined && { max: band.max }),
    },
  });

export const DEALS_INPUT = JSON.stringify({ deals: true });

const TAG_GROUP_ID = /^tag-group\.([^.]+)(?:\.(.+))?$/;

/** Sections and values built from product tags (Metal, Stone…) are English
 * because tags can't be translated in Shopify, so their labels come from the
 * dictionary when it has one. Shopify's own facets arrive already translated. */
function translateTagFilter(filter: CatalogFilter, t: Dictionary["collection"]): CatalogFilter {
  const group = filter.id.match(TAG_GROUP_ID);
  if (!group) return filter;

  const groups = t.groups as Record<string, string>;
  const values = t.tagValues as Record<string, string>;
  return {
    ...filter,
    label: groups[group[1]] ?? filter.label,
    values: filter.values.map((value) => {
      const key = value.id.match(TAG_GROUP_ID)?.[2];
      return { ...value, label: (key && values[key]) || value.label };
    }),
  };
}

/**
 * Shopify's own facets keep the order set in Search & Discovery; our Price
 * presets take the place of Shopify's price slider (or go last if it isn't
 * returned), and Deals always closes the list.
 */
export function buildFilterSections(
  filters: CatalogFilter[],
  t: Dictionary["collection"]
): FilterSection[] {
  const sections: FilterSection[] = filters
    .filter((filter) => filter.id !== AVAILABILITY_FILTER_ID)
    .map((filter) => translateTagFilter(filter, t))
    .map((filter) =>
      filter.type === "PRICE_RANGE"
        ? { key: filter.id, label: t.price, kind: "price" }
        : { key: filter.id, label: filter.label, kind: "list", filter },
    );
  if (!sections.some((section) => section.kind === "price")) {
    sections.push({ key: "price", label: t.price, kind: "price" });
  }
  return sections;
}

export function appliedCount(section: FilterSection, active: string[]): number {
  if (section.kind === "deals") return active.includes(DEALS_INPUT) ? 1 : 0;
  if (section.kind === "price") {
    return PRICE_BANDS.filter((band) => active.includes(bandInput(band)))
      .length;
  }
  if (section.kind === "category") {
    const current = section.categoryLinks?.some((link) => link.current) ? 1 : 0;
    const siblings =
      section.categoryLinks?.filter(
        (link) => !link.current && active.includes(link.input),
      ).length ?? 0;
    return current + siblings;
  }
  return (
    section.filter?.values.filter((value) => active.includes(value.input))
      .length ?? 0
  );
}
