import { PRICE_BANDS, type PriceBand } from "@/config/catalog";
import type { CatalogFilter } from "@/types/catalog";

/** One collapsible group in the filters UI. `list` sections are Shopify
 * facets (whatever Search & Discovery returns); `price` and `deals` are
 * built here because Shopify has no equivalent. */
export type FilterSection = {
  key: string;
  label: string;
  kind: "list" | "price" | "deals";
  filter?: CatalogFilter;
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

/**
 * Shopify's own facets keep the order set in Search & Discovery; our Price
 * presets take the place of Shopify's price slider (or go last if it isn't
 * returned), and Deals always closes the list.
 */
export function buildFilterSections(filters: CatalogFilter[]): FilterSection[] {
  const sections: FilterSection[] = filters
    .filter((filter) => filter.id !== AVAILABILITY_FILTER_ID)
    .map((filter) =>
      filter.type === "PRICE_RANGE"
        ? { key: filter.id, label: filter.label, kind: "price" }
        : { key: filter.id, label: filter.label, kind: "list", filter },
    );
  if (!sections.some((section) => section.kind === "price")) {
    sections.push({ key: "price", label: "Price", kind: "price" });
  }
  sections.push({ key: "deals", label: "Deals", kind: "deals" });
  return sections;
}

export function appliedCount(section: FilterSection, active: string[]): number {
  if (section.kind === "deals") return active.includes(DEALS_INPUT) ? 1 : 0;
  if (section.kind === "price") {
    return PRICE_BANDS.filter((band) => active.includes(bandInput(band)))
      .length;
  }
  return (
    section.filter?.values.filter((value) => active.includes(value.input))
      .length ?? 0
  );
}
