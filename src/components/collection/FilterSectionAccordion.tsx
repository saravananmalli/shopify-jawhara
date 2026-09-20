"use client";

import { useId } from "react";
import { ChevronDownIcon } from "@/components/icons";

/** One collapsible group in the filters drawer (heading + chevron, like the
 * accordion on most jewellery/e-commerce filter panels). */
export default function FilterSectionAccordion({
  label,
  appliedCount,
  open,
  onToggle,
  children,
}: {
  label: string;
  appliedCount: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = useId();

  return (
    <section className="border-b border-gold-100">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 py-3 text-start font-sans text-[13px] font-semibold text-brown-900"
        >
          <span className="flex items-center gap-2">
            {label}
            {appliedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-medium text-white">
                {appliedCount}
              </span>
            )}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-brown-900/60 transition-transform duration-300 ease-luxury ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="pb-3">
        {children}
      </div>
    </section>
  );
}
