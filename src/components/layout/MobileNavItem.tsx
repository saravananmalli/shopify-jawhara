"use client";

import { useState } from "react";
import Link from "@/components/ui/Link";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";

/**
 * Mobile-drawer counterpart to the desktop mega-menu — same real Shopify
 * menu data, rendered as a tap-to-expand accordion instead of a hover
 * panel since there's no hover on touch. Recursive so it handles any
 * nesting depth (a column, a leaf link, or a leaf that itself opens its
 * own flyout columns on desktop) with the same toggle mechanic at every
 * level, rather than dead-ending on deeper items.
 */
export default function MobileNavItem({
  link,
  onNavigate,
  depth = 0,
}: {
  link: NavLink;
  onNavigate: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = link.items.length > 0;

  const headingClass =
    depth === 0
      ? "uppercase tracking-wide"
      : depth === 1
        ? "text-[11px] font-semibold uppercase tracking-widest text-gold-700"
        : "text-sm normal-case text-brown-900/80";

  if (!hasChildren) {
    return (
      <li className={depth === 0 ? "border-b border-gold-100" : undefined}>
        <Link
          href={link.url}
          onClick={onNavigate}
          className={`block py-3 ${headingClass}`}
        >
          <DirhamText text={link.title} />
        </Link>
      </li>
    );
  }

  return (
    <li className={depth === 0 ? "border-b border-gold-100" : undefined}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`flex w-full items-center justify-between py-3 ${headingClass}`}
      >
        <DirhamText text={link.title} />
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-900/50 transition-transform duration-200 ease-luxury ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <ul
          className={`flex flex-col ps-3 ${depth === 0 ? "gap-4 pb-4" : "mt-2 gap-2"}`}
        >
          {link.items.map((child) => (
            <MobileNavItem
              key={child.title}
              link={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
