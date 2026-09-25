"use client";

import { useState } from "react";
import Link from "@/components/ui/Link";
import Chip from "@/components/ui/Chip";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";
import { useRoutePath } from "@/hooks/useRoutePath";
import { toTitleCase } from "@/utils/format";
import { isNavLinkActive, NAV_ACTIVE_TEXT } from "@/utils/nav";

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
  const active = isNavLinkActive(link, useRoutePath());

  const rowPadding = depth === 0 ? "py-3" : "py-2";
  // Top-level items are title case like the desktop nav, even if the Shopify
  // menu title is typed in capitals; column headings stay as uppercase eyebrows.
  const title = depth === 0 ? toTitleCase(link.title) : link.title;
  const headingClass =
    depth === 0
      ? "tracking-wide"
      : depth === 1
        ? "text-[11px] font-semibold uppercase tracking-widest text-gold-700"
        : "text-sm normal-case text-brown-900/80";

  if (!hasChildren) {
    return (
      <li className={depth === 0 ? "border-b border-gold-100" : undefined}>
        <Link
          href={link.url}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-1.5 ${rowPadding} ${headingClass} ${active ? NAV_ACTIVE_TEXT : ""}`}
        >
          <DirhamText text={title} />
          {link.badge && (
            <Chip tone="highlight">
              <span dir="auto">{link.badge}</span>
            </Chip>
          )}
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
        className={`flex w-full items-center justify-between ${rowPadding} ${headingClass} ${active ? NAV_ACTIVE_TEXT : ""}`}
      >
        <DirhamText text={title} />
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-900/50 transition-transform duration-200 ease-luxury ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <ul
          className={`flex flex-col ps-3 ${depth === 0 ? "gap-1 pb-3" : "gap-0"}`}
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
