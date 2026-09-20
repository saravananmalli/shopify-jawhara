"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import FilterOptions, {
  type FilterActions,
} from "@/components/collection/FilterOptions";
import FilterSectionAccordion from "@/components/collection/FilterSectionAccordion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { appliedCount, type FilterSection } from "@/utils/catalog-filters";

export default function FiltersDrawer({
  sections,
  actions,
  resultLabel,
  onClearAll,
  onClose,
}: {
  sections: FilterSection[];
  actions: FilterActions;
  resultLabel: string;
  onClearAll: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose);

  // Start with the first two sections open, plus any that already have a selection.
  const [openKeys, setOpenKeys] = useState(
    () =>
      new Set(
        sections
          .filter(
            (section, index) =>
              index < 2 || appliedCount(section, actions.active) > 0,
          )
          .map((section) => section.key),
      ),
  );
  const toggleSection = (key: string) =>
    setOpenKeys((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close filters"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brown-900/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-3">
          <h2 className="font-sans text-lg font-medium text-gold-600">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {sections.map((section) => (
            <FilterSectionAccordion
              key={section.key}
              label={section.label}
              appliedCount={appliedCount(section, actions.active)}
              open={openKeys.has(section.key)}
              onToggle={() => toggleSection(section.key)}
            >
              <FilterOptions section={section} actions={actions} />
            </FilterSectionAccordion>
          ))}
        </div>

        <div className="flex gap-2 border-t border-gold-100 px-5 py-3">
          <button
            type="button"
            onClick={onClearAll}
            disabled={actions.active.length === 0}
            className="h-10 flex-1 rounded-lg border border-[#D6D3D1] text-[13px] text-brown-900 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-[2] rounded-lg bg-gold-600 text-[13px] font-medium text-white transition-colors hover:bg-gold-700"
          >
            Show {resultLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
