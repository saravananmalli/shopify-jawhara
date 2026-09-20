"use client";

import { SlidersIcon } from "@/components/icons";
import SelectDropdown from "@/components/ui/SelectDropdown";
import FilterDropdown from "@/components/collection/FilterDropdown";
import type { FilterActions } from "@/components/collection/FilterOptions";
import { useDictionary } from "@/store/locale";
import { appliedCount, type FilterSection } from "@/utils/catalog-filters";
import type { CatalogSortKey } from "@/types/catalog";

/** Inline dropdowns beyond this many live only in the "Show All Filters" drawer. */
const MAX_INLINE_FILTERS = 4;

/** "Show All Filters" and the sort dropdown share one width: half the row on
 * phones, a fixed width from sm. An explicit half-row basis, not `flex-1`:
 * with a zero basis the button's padding and border would make it wider than
 * the dropdown. 0.25rem is half the row's 0.5rem gap. */
const FILTER_CONTROL_WIDTH_CLASS = "min-w-0 basis-[calc(50%-0.25rem)] sm:w-48 sm:basis-auto";

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
  const { collection: t } = useDictionary();
  const totalApplied = actions.active.length;

  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-2 border-y border-gold-100 py-2 sm:py-3">
      <p aria-live="polite" className="basis-full font-sans text-sm text-brown-900 sm:me-2 sm:basis-auto sm:text-base">
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
          {t.clearAll}
        </button>
      )}

      <button
        type="button"
        onClick={onOpenFilters}
        aria-haspopup="dialog"
        className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gold-600 bg-white px-2.5 font-sans text-[13px] font-medium text-gold-700 transition-colors hover:bg-cream-100 ${FILTER_CONTROL_WIDTH_CLASS}`}
      >
        <SlidersIcon className="h-4 w-4" />
        {t.showAllFilters}
        {totalApplied > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-medium text-white">
            {totalApplied}
          </span>
        )}
      </button>

      <div className="flex min-w-0 basis-[calc(50%-0.25rem)] items-center gap-2 font-sans text-[13px] sm:ms-auto sm:basis-auto">
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
