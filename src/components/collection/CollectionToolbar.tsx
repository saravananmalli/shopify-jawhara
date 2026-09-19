"use client";

import { ChevronDownIcon, SlidersIcon } from "@/components/icons";
import FilterDropdown from "@/components/collection/FilterDropdown";
import type { FilterActions } from "@/components/collection/FilterOptions";
import { appliedCount, type FilterSection } from "@/utils/catalog-filters";
import type { CatalogSortKey } from "@/types/catalog";

/** Inline dropdowns beyond this many live only in the "Show All Filters" drawer. */
const MAX_INLINE_FILTERS = 4;

export default function CollectionToolbar({
  countLabel,
  sections,
  actions,
  sort,
  sortOptions,
  onSortChange,
  onOpenFilters,
  onClearAll,
}: {
  countLabel: string;
  sections: FilterSection[];
  actions: FilterActions;
  sort: CatalogSortKey;
  sortOptions: { key: CatalogSortKey; label: string }[];
  onSortChange: (sort: CatalogSortKey) => void;
  onOpenFilters: () => void;
  onClearAll: () => void;
}) {
  const totalApplied = actions.active.length;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 border-y border-gold-100 py-3">
      <p aria-live="polite" className="mr-2 font-sans text-base text-brown-900">
        {countLabel}
      </p>

      <div className="hidden items-center gap-2 lg:flex">
        {sections.slice(0, MAX_INLINE_FILTERS).map((section) => (
          <FilterDropdown
            key={section.key}
            section={section}
            activeCount={appliedCount(section, actions.active)}
            actions={actions}
          />
        ))}
      </div>

      {totalApplied > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="h-9 px-1 font-sans text-[13px] text-brown-900/70 underline underline-offset-4 transition-colors hover:text-gold-700"
        >
          Clear all
        </button>
      )}

      <button
        type="button"
        onClick={onOpenFilters}
        aria-haspopup="dialog"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-gold-600 bg-white px-3 font-sans text-[13px] font-medium text-gold-700 transition-colors hover:bg-cream-100"
      >
        <SlidersIcon className="h-4 w-4" />
        Show All Filters
        {totalApplied > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-medium text-white">
            {totalApplied}
          </span>
        )}
      </button>

      <div className="ml-auto flex items-center gap-2 font-sans text-[13px]">
        <label htmlFor="collection-sort" className="text-brown-900/60">
          Sort By:
        </label>
        <div className="relative">
          <select
            id="collection-sort"
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as CatalogSortKey)
            }
            className="h-9 cursor-pointer appearance-none rounded-lg border border-[#D6D3D1] bg-white py-0 pl-3 pr-8 text-brown-900 focus-visible:border-gold-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-600"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-900" />
        </div>
      </div>
    </div>
  );
}
