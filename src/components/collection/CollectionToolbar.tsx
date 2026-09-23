"use client";

import { SlidersIcon } from "@/components/icons";
import SelectDropdown from "@/components/ui/SelectDropdown";
import FilterDropdown from "@/components/collection/FilterDropdown";
import QuickTagDropdown from "@/components/collection/QuickTagDropdown";
import type { FilterActions } from "@/components/collection/FilterOptions";
import { useDictionary } from "@/store/locale";
import { appliedCount, type FilterSection } from "@/utils/catalog-filters";
import type { CatalogSortKey } from "@/types/catalog";

/** Inline dropdowns beyond this many live only in the "Show All Filters" drawer. */
const MAX_INLINE_FILTERS = 4;

/** Category never shows as an inline dropdown, on any screen size — the
 * curation/"all" pages it appears on already have a visual tile strip for
 * the same choice above the toolbar, so a second copy inline would be
 * redundant. It's still reachable, like every section, via "Show All
 * Filters" (FiltersDrawer maps the full `sections` list, unfiltered). */
const INLINE_EXCLUDED_KEYS = new Set(["category"]);

/** "Show All Filters" and the sort dropdown share the row on phones, a fixed
 * width from sm. `flex-1` (not a fixed percentage basis) so they shrink to
 * make room for "Clear all" when it appears between them instead of the
 * whole row wrapping — both sides already truncate their label text, so they
 * degrade gracefully rather than overflowing. */
const FILTER_CONTROL_WIDTH_CLASS = "min-w-0 flex-1 sm:w-48 sm:flex-none";

export default function CollectionToolbar({
  countLabel,
  sections,
  actions,
  quickTagSelected,
  onQuickTagSelect,
  sort,
  sortOptions,
  onSortChange,
  onOpenFilters,
  onClearAll,
}: {
  countLabel: string;
  sections: FilterSection[];
  actions: FilterActions;
  /** Currently active "New Arrival / Bestseller / Trending" tag, or null for "All". */
  quickTagSelected: string | null;
  onQuickTagSelect: (tag: string | null) => void;
  sort: CatalogSortKey;
  sortOptions: { key: CatalogSortKey; label: string }[];
  onSortChange: (sort: CatalogSortKey) => void;
  onOpenFilters: () => void;
  onClearAll: () => void;
}) {
  const { collection: t } = useDictionary();
  const totalApplied = actions.active.length;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-y border-gold-100 py-2 sm:py-3">
      {/* Product count: desktop only — on mobile the toolbar goes straight to
          the filter/sort controls, and the count is still there in the
          "Show All Filters" drawer's "Show {label}" button. */}
      <p aria-live="polite" className="hidden font-sans text-sm text-brown-900 sm:me-2 sm:block sm:basis-auto sm:text-base">
        {countLabel}
      </p>

      {/* Metal/Stone/Price… — and the New Arrival/Bestseller/Trending pick
          alongside them — are desktop-only inline dropdowns; on mobile the
          same choices live in the "Show All Filters" drawer instead. */}
      <div className="hidden items-center gap-2 lg:flex">
        <QuickTagDropdown selected={quickTagSelected} onSelect={onQuickTagSelect} />
        {sections
          .filter((section) => !INLINE_EXCLUDED_KEYS.has(section.key))
          .slice(0, MAX_INLINE_FILTERS)
          .map((section) => (
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
          className="h-9 shrink-0 px-1 font-sans text-[13px] text-brown-900/70 underline underline-offset-4 transition-colors hover:text-gold-700"
        >
          {t.clearAll}
        </button>
      )}

      <button
        type="button"
        onClick={onOpenFilters}
        aria-haspopup="dialog"
        className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border bg-white px-2.5 font-sans text-[13px] font-medium text-brown-900 transition-colors hover:border-gold-600 hover:bg-cream-100 ${
          totalApplied > 0 ? "border-gold-600" : "border-[#D6D3D1]"
        } ${FILTER_CONTROL_WIDTH_CLASS}`}
      >
        <SlidersIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">{t.showAllFilters}</span>
        {totalApplied > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-medium text-white">
            {totalApplied}
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 font-sans text-[13px] sm:ms-auto sm:flex-none">
        <span aria-hidden className="hidden text-brown-900/60 sm:inline">
          {t.sortBy}
        </span>
        <SelectDropdown
          label={t.sortBy}
          value={sort}
          options={sortOptions.map((option) => option.key)}
          optionLabel={(key) => sortOptions.find((option) => option.key === key)?.label ?? key}
          onChange={(next) => onSortChange(next as CatalogSortKey)}
          size="sm"
          menuAlign="end"
          className="min-w-0 flex-1 sm:w-48 sm:flex-none"
        />
      </div>
    </div>
  );
}
