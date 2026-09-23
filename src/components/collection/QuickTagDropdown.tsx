"use client";

import { ChevronDownIcon } from "@/components/icons";
import { useDictionary } from "@/store/locale";
import { QUICK_TAG_CHIPS } from "@/config/catalog";
import QuickTagOptions from "@/components/collection/QuickTagOptions";
import { useDismissableDropdown } from "@/hooks/useDismissableDropdown";

/**
 * Same trigger/panel chrome as FilterDropdown (Metal, Material…) so the
 * "New Arrival / Bestseller / Trending" quick pick reads as one more filter
 * in the desktop toolbar row. On mobile this control is hidden — the same
 * choice lives in the "Show All Filters" drawer instead (FiltersDrawer),
 * via the shared QuickTagOptions list.
 */
export default function QuickTagDropdown({
  selected,
  onSelect,
}: {
  /** Currently active tag (e.g. "New Arrival"), or null when "All" applies. */
  selected: string | null;
  onSelect: (tag: string | null) => void;
}) {
  const { collection: t } = useDictionary();
  const { open, setOpen, rootRef, buttonRef, panelId } = useDismissableDropdown();

  const activeChip = QUICK_TAG_CHIPS.find((chip) => chip.tag === selected);

  function choose(tag: string | null) {
    onSelect(tag);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 font-sans text-[13px] text-brown-900 transition-colors hover:border-gold-600 ${
          activeChip ? "border-gold-600" : "border-[#D6D3D1]"
        }`}
      >
        {activeChip ? t.chips[activeChip.key] : t.all}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={t.all}
          className="absolute start-0 top-full z-30 mt-1.5 w-52 rounded-xl border border-gold-100 bg-white p-3 shadow-lg"
        >
          <QuickTagOptions selected={selected} onSelect={choose} name="quick-tag-toolbar" />
        </div>
      )}
    </div>
  );
}
