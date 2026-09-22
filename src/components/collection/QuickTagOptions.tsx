"use client";

import { useDictionary } from "@/store/locale";
import { QUICK_TAG_CHIPS } from "@/config/catalog";

/**
 * The "New Arrival / Bestseller / Trending" radio list — one exclusive
 * choice, unlike the checkbox facets in FilterOptions. Shared by the desktop
 * QuickTagDropdown panel and the mobile filters drawer so both stay in sync.
 */
export default function QuickTagOptions({
  selected,
  onSelect,
  name,
}: {
  /** Currently active tag (e.g. "New Arrival"), or null when "All" applies. */
  selected: string | null;
  onSelect: (tag: string | null) => void;
  /** Radio group name — must be unique per rendered instance on the page. */
  name: string;
}) {
  const { collection: t } = useDictionary();

  return (
    <ul>
      <li>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 font-sans text-[13px] text-brown-900 hover:bg-cream-100">
          <input
            type="radio"
            name={name}
            checked={selected === null}
            onChange={() => onSelect(null)}
            className="h-4 w-4 shrink-0 cursor-pointer accent-gold-600"
          />
          <span className="flex-1">{t.all}</span>
        </label>
      </li>
      {QUICK_TAG_CHIPS.map((chip) => (
        <li key={chip.tag}>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 font-sans text-[13px] text-brown-900 hover:bg-cream-100">
            <input
              type="radio"
              name={name}
              checked={selected === chip.tag}
              onChange={() => onSelect(chip.tag)}
              className="h-4 w-4 shrink-0 cursor-pointer accent-gold-600"
            />
            <span className="flex-1">{t.chips[chip.key]}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
