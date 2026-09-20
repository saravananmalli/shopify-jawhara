"use client";

import MenuLink from "@/components/layout/MenuLink";
import { ChevronRightIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";

/**
 * One row in the Jewellery mega-menu's Department sidebar. If the row's
 * own Shopify menu item has nested columns (a 4th real menu level), hovering
 * or focusing it opens a secondary cascading panel to the right — a flyout
 * inside the flyout. Only rows with real nested data get this; a row with
 * no children stays a plain link. Uses a Tailwind named group (`group/row`)
 * so this row's own hover state doesn't interfere with the outer panel's.
 */
export default function DepartmentFlyoutRow({
  item,
  highlighted,
}: {
  item: NavLink;
  highlighted: boolean;
}) {
  const hasFlyout = item.items.length > 0;

  return (
    <li className={hasFlyout ? "group/row relative" : undefined}>
      <MenuLink
        href={item.url}
        aria-haspopup={hasFlyout ? "true" : undefined}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
          highlighted
            ? "border-l-2 border-gold-600 bg-gold-50 font-semibold text-brown-900"
            : "text-brown-900/80 hover:bg-cream-100 hover:text-gold-700"
        }`}
      >
        <DirhamText text={item.title} />
        {(highlighted || hasFlyout) && (
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gold-600" />
        )}
      </MenuLink>

      {hasFlyout && (
        <div className="invisible absolute left-full top-0 z-10 pl-3 opacity-0 transition-[opacity,visibility] duration-200 ease-luxury group-hover/row:visible group-hover/row:opacity-100 group-focus-within/row:visible group-focus-within/row:opacity-100">
          <div className="flex min-w-[480px] gap-10 rounded-r-2xl border border-gold-100 bg-white p-6 shadow-xl">
            {item.items.map((column) => (
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
      )}
    </li>
  );
}
