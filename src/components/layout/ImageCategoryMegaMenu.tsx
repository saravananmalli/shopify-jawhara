"use client";

import Image from "next/image";
import Link from "@/components/ui/Link";
import MenuLink from "@/components/layout/MenuLink";
import MenuColumnHeading from "@/components/layout/MenuColumnHeading";
import MenuPanel from "@/components/layout/MenuPanel";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import { useMenuIntent } from "@/hooks/useMenuIntent";
import { toTitleCase } from "@/utils/format";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { NavLink, Collection } from "@/types/content";
import { NAV_ACTIVE_TEXT } from "@/utils/nav";

// 2x the fixed tile width (~200px per the `sizes` breakpoint).
const MEGA_MENU_TILE_IMAGE_WIDTH = 480;

/**
 * Reusable mega-menu for nav items whose dropdown should lead with a title
 * + "Shop All" header row above a grid of real Shopify collection image
 * tiles (used for "Gold" and "Diamonds" — same tile-grid treatment, each
 * fed its own set of collections). This header/grid treatment is specific
 * to these dropdowns, not shared with any other page. Each tile only
 * renders once its collection actually has an image set in Shopify Admin
 * (no placeholder). Any real menu columns added under the nav item still
 * render below the grid, same pattern as the generic MegaMenuItem.
 */
export default function ImageCategoryMegaMenu({
  link,
  isActive,
  categories,
}: {
  link: NavLink;
  isActive: boolean;
  categories: Collection[];
}) {
  const imageCategories = categories.filter((c) => c.imageUrl);
  const hasContent = link.items.length > 0 || imageCategories.length > 0;

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
            <div className="page-container py-6">
              {imageCategories.length > 0 && (
                <>
                  <div className="grid grid-cols-6 gap-4">
                    {imageCategories.map((category) => (
                      <MenuLink
                        key={category.id}
                        href={`/collections/${category.handle}`}
                        className="group/tile block"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-100">
                          {armed && (
                            <Image
                              src={getShopifyImageUrl(category.imageUrl!, MEGA_MENU_TILE_IMAGE_WIDTH)}
                              alt={category.imageAlt}
                              fill
                              sizes="(min-width: 1280px) 200px, 16vw"
                              placeholder="blur"
                              blurDataURL={IMAGE_BLUR_DATA_URL}
                              className="object-cover transition-transform duration-300 ease-luxury group-hover/tile:scale-105"
                            />
                          )}
                        </div>
                        <p className="mt-2 text-center text-sm font-medium text-brown-900">
                          <DirhamText text={category.title} />
                        </p>
                      </MenuLink>
                    ))}
                  </div>
                </>
              )}

              {link.items.length > 0 && (
                <div className={`flex gap-10 ${imageCategories.length > 0 ? "mt-6" : ""}`}>
                  {link.items.map((column) => (
                    <div key={column.title} className="min-w-[140px] flex-1">
                      <MenuColumnHeading column={column} />
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
              )}
            </div>
          </div>
        </MenuPanel>
      )}
    </li>
  );
}
