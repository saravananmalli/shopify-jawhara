"use client";

import Link from "@/components/ui/Link";
import MenuLink from "@/components/layout/MenuLink";
import MenuPanel from "@/components/layout/MenuPanel";
import Chip from "@/components/ui/Chip";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import { useMenuIntent } from "@/hooks/useMenuIntent";
import type { NavLink } from "@/types/content";
import { NAV_ACTIVE_TEXT } from "@/utils/nav";
import { toTitleCase } from "@/utils/format";

/**
 * "Our Collections" nav item — a flat grid of its direct Shopify menu
 * items (same menu-driven pattern as Jewellery/Gifts), styled as a plain
 * multi-column grid instead of headed sections.
 */
export default function OurCollectionsMegaMenu({
  link,
  isActive,
}: {
  link: NavLink;
  isActive: boolean;
}) {
  const hasContent = link.items.length > 0;

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
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasContent ? "true" : undefined}
        className={`flex items-center gap-1 whitespace-nowrap capitalize outline-none transition-colors hover:text-gold-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${
          isActive ? NAV_ACTIVE_TEXT : ""
        }`}
      >
        <DirhamText text={toTitleCase(link.title)} />
        {hasContent && (
          <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 ease-luxury group-data-open:rotate-180" />
        )}
      </Link>

      {hasContent && (
        <MenuPanel armed={armed}>
          <div className="w-full border-t border-gold-100 bg-white normal-case shadow-xl">
            <div className="grid page-container grid-cols-6 gap-x-8 gap-y-5 py-6">
              {link.items.map((item) => (
                <MenuLink
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-1.5 text-sm text-brown-900/80 transition-colors hover:text-gold-700"
                >
                  <DirhamText text={item.title} />
                  {item.badge && (
                    <Chip tone="highlight">
                      <span dir="auto">{item.badge}</span>
                    </Chip>
                  )}
                </MenuLink>
              ))}
            </div>
          </div>
        </MenuPanel>
      )}
    </li>
  );
}
