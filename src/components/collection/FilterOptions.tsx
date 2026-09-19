"use client";

import { DirhamSymbol } from "dirham/react";
import { PRICE_BANDS } from "@/config/catalog";
import {
  bandInput,
  DEALS_INPUT,
  type FilterSection,
} from "@/utils/catalog-filters";

export type FilterActions = {
  /** Canonical JSON of every applied filter. */
  active: string[];
  onToggle: (input: string) => void;
  currencyCode: string;
};

const formatAmount = (amount: number) => amount.toLocaleString("en-US");

function Amount({
  value,
  currencyCode,
}: {
  value: number;
  currencyCode: string;
}) {
  // The dirham sign is only correct for AED; any other market shows its code.
  return currencyCode === "AED" ? (
    <span className="inline-flex items-center gap-0.5">
      <DirhamSymbol size="0.85em" />
      {formatAmount(value)}
    </span>
  ) : (
    <>
      {currencyCode} {formatAmount(value)}
    </>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 font-sans text-[13px] text-brown-900 hover:bg-cream-100">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 cursor-pointer accent-gold-600"
        />
        <span className="flex-1">{label}</span>
        {count !== undefined && (
          <span className="text-[13px] text-brown-900/50">({count})</span>
        )}
      </label>
    </li>
  );
}

/** The body of one filter section — shared by the toolbar dropdowns and the filters drawer. */
export default function FilterOptions({
  section,
  actions,
}: {
  section: FilterSection;
  actions: FilterActions;
}) {
  const { active, onToggle, currencyCode } = actions;

  if (section.kind === "deals") {
    return (
      <ul>
        <CheckRow
          label="On sale"
          checked={active.includes(DEALS_INPUT)}
          onChange={() => onToggle(DEALS_INPUT)}
        />
      </ul>
    );
  }

  if (section.kind === "price") {
    return (
      <ul>
        {PRICE_BANDS.map((band) => {
          const label =
            band.min === undefined ? (
              <>
                Under{" "}
                <Amount value={band.max ?? 0} currencyCode={currencyCode} />
              </>
            ) : band.max === undefined ? (
              <>
                Above <Amount value={band.min} currencyCode={currencyCode} />
              </>
            ) : (
              <>
                <Amount value={band.min} currencyCode={currencyCode} />
                {" – "}
                <Amount value={band.max} currencyCode={currencyCode} />
              </>
            );
          const input = bandInput(band);
          return (
            <CheckRow
              key={input}
              label={label}
              checked={active.includes(input)}
              onChange={() => onToggle(input)}
            />
          );
        })}
      </ul>
    );
  }

  const filter = section.filter;
  if (!filter) return null;

  return (
    <ul className="max-h-64 overflow-y-auto">
      {filter.values.map((value) => {
        const checked = active.includes(value.input);
        // An empty facet can't produce results — hide it unless it's applied.
        if (value.count === 0 && !checked) return null;
        return (
          <CheckRow
            key={value.id}
            label={value.label}
            count={value.count}
            checked={checked}
            onChange={() => onToggle(value.input)}
          />
        );
      })}
    </ul>
  );
}
