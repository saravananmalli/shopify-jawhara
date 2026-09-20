"use client";

import Image from "next/image";
import Link from "next/link";
import MenuLink from "@/components/layout/MenuLink";
import MenuPanel from "@/components/layout/MenuPanel";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import { useMenuIntent } from "@/hooks/useMenuIntent";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { NavLink, Collection } from "@/types/content";

// 2x the fixed 224px promo tile width.
const GIFTS_PROMO_IMAGE_WIDTH = 480;

/**
 * "Gifts" nav item — same column layout as the generic MegaMenuItem, plus
 * a real Shopify collection image as a promo tile on the right. The tile
 * only renders when the collection actually has an image set in Shopify
 * Admin (no placeholder/fake image); until then the columns still render
 * normally without a gap where the tile would be.
 */
export default function GiftsMegaMenu({
  link,
  isActive,
  promoCollection,
}: {
  link: NavLink;
  isActive: boolean;
  promoCollection: Collection | null;
}) {
  const hasPromo = Boolean(promoCollection?.imageUrl);
  const hasContent = link.items.length > 0 || hasPromo;

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
        aria-haspopup={hasContent ? "true" : undefined}
        className={`flex items-center gap-1 whitespace-nowrap uppercase outline-none transition-colors hover:text-gold-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${
          isActive ? "text-gold-700" : ""
        }`}
      >
        <DirhamText text={link.title} />
        {hasContent && (
          <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 ease-luxury group-hover:rotate-180 group-focus-within:rotate-180" />
        )}
      </Link>

      {hasContent && (
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

              {hasPromo && promoCollection && (
                <MenuLink
                  href={`/collections/${promoCollection.handle}`}
                  className="group/promo block w-56 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                >
                  <div className="relative aspect-[4/3]">
                    {armed && (
                      <Image
                        src={getShopifyImageUrl(promoCollection.imageUrl!, GIFTS_PROMO_IMAGE_WIDTH)}
                        alt={promoCollection.imageAlt}
                        fill
                        sizes="224px"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        className="object-cover transition-transform duration-300 ease-luxury group-hover/promo:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-brown-900">
                      <DirhamText text={promoCollection.title} />
                    </p>
                    <p className="mt-0.5 text-xs text-gold-700">Shop the collection &rarr;</p>
                  </div>
                </MenuLink>
              )}
            </div>
          </div>
        </MenuPanel>
      )}
    </li>
  );
}
