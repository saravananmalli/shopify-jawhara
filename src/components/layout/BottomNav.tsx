"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { CloseIcon } from "@/components/icons";
import NavIcon from "@/components/ui/NavIcon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRoutePath } from "@/hooks/useRoutePath";
import { useDictionary } from "@/store/locale";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";
import { shopifyConfig } from "@/config/shopify";
import type { CategoryTile, Collection } from "@/types/content";

// 2x the rendered card image (~85px wide in the 3-column sheets).
const SHEET_IMAGE_WIDTH = 240;

type SheetKey = "categories" | "collections";

type TabKey = "home" | "categories" | "collections" | "account";

/**
 * Phone-only bottom tab bar (Home / Categories / Account / Cart) — the
 * thumb-reach counterpart of the header, which on a phone carries only the
 * menu, search and bag. Categories opens a bottom sheet of the real Shopify
 * category collections; Cart opens the same drawer as the header's bag button.
 */
export default function BottomNav({
  categories,
  collectionTiles,
  ourCollectionsUrl,
}: {
  categories: Collection[];
  /** Collections linked under "Our Collections" in the Shopify main menu. */
  collectionTiles: CategoryTile[];
  /** The "Our Collections" link from the Shopify main menu. */
  ourCollectionsUrl: string;
}) {
  const { bottomNav: t, common, collection } = useDictionary();
  const pathname = useRoutePath();

  // Which bottom sheet is open — Categories or Collections (both 3 columns).
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const [lastSheet, setLastSheet] = useState<SheetKey>("categories");
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeSheet = useCallback(() => setOpenSheet(null), []);
  const toggleSheet = (key: SheetKey) => {
    setLastSheet(key);
    setOpenSheet((current) => (current === key ? null : key));
  };
  const sheetOpen = openSheet !== null;
  useFocusTrap(sheetRef, sheetOpen, closeSheet);

  const isActive: Record<TabKey, boolean> = {
    home: pathname === "/" && !sheetOpen,
    // Any other collection page belongs to Categories, except the Our
    // Collections landing itself.
    categories:
      openSheet === "categories" ||
      (!sheetOpen && pathname.startsWith("/collections") && pathname !== ourCollectionsUrl),
    collections: openSheet === "collections" || (!sheetOpen && pathname === ourCollectionsUrl),
    account: false, // leaves the site for Shopify, so it never shows as current
  };


  type SheetLink = { key: string; href: string; title: string; imageUrl: string | null; imageAlt: string };
  // Shopify's automatic "all products" page first, then the real categories.
  const categoryLinks: SheetLink[] = [
    { key: ALL_PRODUCTS_HANDLE, href: `/collections/${ALL_PRODUCTS_HANDLE}`, title: t.allJewellery, imageUrl: null, imageAlt: "" },
    ...categories.map((category) => ({
      key: category.handle,
      href: `/collections/${category.handle}`,
      title: category.title,
      imageUrl: category.imageUrl,
      imageAlt: category.imageAlt,
    })),
  ];
  // The Our Collections landing first, then every collection linked under it.
  const collectionLinks: SheetLink[] = [
    { key: "all-collections", href: ourCollectionsUrl, title: t.allCollections, imageUrl: null, imageAlt: "" },
    ...collectionTiles.map((tile) => ({
      key: tile.handle,
      href: `/collections/${tile.handle}`,
      title: tile.title,
      imageUrl: tile.imageUrl,
      imageAlt: tile.imageAlt,
    })),
  ];
  const sheet = {
    categories: {
      title: t.sheetTitle,
      close: t.closeSheet,
      label: collection.shopByCategory,
      links: categoryLinks,
      grid: "grid-cols-3",
      card: "p-2",
      text: "text-xs",
      icon: "categories" as const,
    },
    collections: {
      title: t.collectionsTitle,
      close: t.closeCollections,
      label: t.collectionsTitle,
      links: collectionLinks,
      grid: "grid-cols-3",
      card: "p-2",
      text: "text-xs",
      icon: "collections" as const,
    },
  }[lastSheet];

  const itemClass = (tab: TabKey) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 font-sans text-xs tracking-wide transition-opacity duration-(--motion-fast) ease-luxury focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-600 ${
      isActive[tab] ? "font-semibold text-gold-600" : "text-brown-900/50"
    }`;
  const iconClass = (tab: TabKey) =>
    `h-[26px] w-[26px] transition-transform duration-(--motion-fast) ease-luxury ${
      isActive[tab] ? "scale-105" : ""
    }`;

  // The product page has its own fixed purchase bar in this spot (ProductInfo).
  if (pathname.startsWith("/products/")) return null;

  return (
    <>
      {/* z-30, under the sticky header (z-40): the header's stacking context also
          holds the cart drawer and mobile menu, which must cover this bar. */}
      <nav
        aria-label={t.label}
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-black/[0.08] bg-white pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-luxury md:hidden [html[data-nav-hidden=true]_&]:translate-y-[calc(100%+1.5rem)]"
      >
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={itemClass("home")}
        >
          <NavIcon name="home" tinted className={iconClass("home")} />
          {common.home}
        </Link>

        <button
          type="button"
          onClick={() => toggleSheet("categories")}
          aria-haspopup="dialog"
          aria-expanded={openSheet === "categories"}
          className={itemClass("categories")}
        >
          <NavIcon name="categories" tinted className={iconClass("categories")} />
          {t.categories}
        </button>

        <button
          type="button"
          onClick={() => toggleSheet("collections")}
          aria-haspopup="dialog"
          aria-expanded={openSheet === "collections"}
          className={itemClass("collections")}
        >
          <NavIcon name="collections" tinted className={iconClass("collections")} />
          {t.ourCollections}
        </button>

        <a href={shopifyConfig.accountUrl} className={itemClass("account")}>
          <NavIcon name="account" tinted className={iconClass("account")} />
          {t.account}
        </a>
      </nav>

      {/* Closed sheet is inert so its links leave the tab order. */}
      <div
        inert={!sheetOpen}
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxury md:hidden ${
          sheetOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/45" onClick={closeSheet} />
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={sheet.label}
          className={`absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-3xl bg-cream-50 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-luxury ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between px-(--page-gutter) py-3">
            <h2 className="font-sans text-lg font-medium text-gold-600">{sheet.title}</h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={sheet.close}
              className="-me-2 flex h-11 w-11 items-center justify-center rounded-full"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <ul className={`grid ${sheet.grid} gap-3 overflow-y-auto px-(--page-gutter) pb-5`}>
            {sheet.links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={closeSheet}
                  className={`flex h-full flex-col items-center gap-2 rounded-2xl bg-white ${sheet.card} text-center shadow-sm active:scale-[0.98]`}
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-cream-100">
                    {link.imageUrl ? (
                      <Image
                        src={getShopifyImageUrl(link.imageUrl, SHEET_IMAGE_WIDTH)}
                        alt={link.imageAlt}
                        fill
                        sizes="(min-width: 640px) 20vw, 30vw"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        className="object-cover"
                      />
                    ) : (
                      // "All …" links and collections without a photo get the tab's icon.
                      <Image
                        src={`/brand/icons/nav/${sheet.icon === "collections" ? "collections.svg" : "categories.webp"}`}
                        alt=""
                        width={40}
                        height={40}
                        className="absolute inset-0 m-auto h-10 w-10 opacity-60"
                      />
                    )}
                  </span>
                  <span dir="auto" className={`font-sans ${sheet.text} font-medium leading-snug text-brown-900`}>
                    {link.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
