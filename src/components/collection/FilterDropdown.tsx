"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import FilterOptions, {
  type FilterActions,
} from "@/components/collection/FilterOptions";
import type { FilterSection } from "@/utils/catalog-filters";

export default function FilterDropdown({
  section,
  activeCount,
  actions,
}: {
  section: FilterSection;
  activeCount: number;
  actions: FilterActions;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 font-sans text-[13px] text-brown-900 transition-colors hover:border-gold-600 ${
          activeCount > 0 ? "border-gold-600" : "border-[#D6D3D1]"
        }`}
      >
        {section.label}
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-medium text-white">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={section.label}
          className="absolute left-0 top-full z-30 mt-1.5 w-60 rounded-xl border border-gold-100 bg-white p-3 shadow-lg"
        >
          <FilterOptions section={section} actions={actions} />
        </div>
      )}
    </div>
  );
}
