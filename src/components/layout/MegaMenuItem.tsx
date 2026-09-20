"use client";

import Link from "@/components/ui/Link";
import MenuLink from "@/components/layout/MenuLink";
import MenuPanel from "@/components/layout/MenuPanel";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import { useMenuIntent } from "@/hooks/useMenuIntent";
import type { NavLink } from "@/types/content";

/**
 * Renders one top-level nav item. `link.items` are mega-menu columns (from
 * a nested Shopify menu item) and each column's own `items` are its leaf
 * links — all real Shopify menu data, nothing hardcoded. A top-level item
 * with no children (today's real `main-menu` data) renders as a plain link,
 * identical to before.
 */
export default function MegaMenuItem({
  link,
  isActive,
}: {
  link: NavLink;
  isActive: boolean;
}) {
  const hasColumns = link.items.length > 0;

  const { armed, intentProps } = useMenuIntent();

  return (
    <li
      {...intentProps}
      className="group"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
    >
      <Link
        href={link.url}
        aria-haspopup={hasColumns ? "true" : undefined}
        className={`flex items-center gap-1 whitespace-nowrap uppercase outline-none transition-colors hover:text-gold-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${
          isActive ? "text-gold-700" : ""
        }`}
      >
        <DirhamText text={link.title} />
        {hasColumns && (
          <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 ease-luxury group-hover:rotate-180 group-focus-within:rotate-180" />
        )}
      </Link>

      {hasColumns && (
        <MenuPanel armed={armed}>
          <div className="w-full border-t border-gold-100 bg-white normal-case shadow-xl">
            <div className="mx-auto flex max-w-8xl gap-10 px-4 py-6">
              {link.items.map((column) => (
                <div key={column.title} className="min-w-[140px] flex-1">
                  <MenuLink
                    href={column.url}
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-gold-700 hover:underline"
                  >
                    <DirhamText text={column.title} />
                  </MenuLink>
                  {column.items.length > 0 && (
                    <ul className="flex flex-col gap-2.5">
                      {column.items.map((leaf) => (
                        <li key={leaf.title}>
                          <MenuLink
                            href={leaf.url}
                            className="text-sm text-brown-900/80 transition-colors hover:text-gold-700"
                          >
                            <DirhamText text={leaf.title} />
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </MenuPanel>
      )}
    </li>
  );
}
