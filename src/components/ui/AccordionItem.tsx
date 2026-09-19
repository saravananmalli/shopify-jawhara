"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";

/**
 * Single collapsible section — product detail page stacks several of
 * these (Product Details, General Specifications, How It Fits). Each
 * toggles independently (not an exclusive-open group); same tap-to-expand
 * mechanic as MobileNavItem, generalized for reuse.
 */
export default function AccordionItem({
  title,
  icon,
  children,
  defaultOpen = false,
  divider = true,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  divider?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={divider ? "border-b border-gold-100" : undefined}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans text-sm font-semibold uppercase tracking-wide text-brown-900"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-900/50 transition-transform duration-200 ease-luxury ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="pb-4 font-sans text-sm leading-relaxed text-brown-900/70"
        >
          {children}
        </div>
      )}
    </div>
  );
}
