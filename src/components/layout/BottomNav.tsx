"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { CloseIcon } from "@/components/icons";
import CountBadge from "@/components/ui/CountBadge";
import NavIcon from "@/components/ui/NavIcon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRoutePath } from "@/hooks/useRoutePath";
import { useCart } from "@/store/cart";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMessage, pluralize } from "@/utils/i18n";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";
import type { Collection } from "@/types/content";

// 2x the rendered card image (~104px wide in the 2-column sheet).
const CATEGORY_IMAGE_WIDTH = 240;

type TabKey = "home" | "categories" | "account" | "cart";

/**
 * Phone-only bottom tab bar (Home / Categories / Account / Cart) — the
 * thumb-reach counterpart of the header, which on a phone carries only the
 * menu, search and bag. Categories opens a bottom sheet of the real Shopify
 * category collections; Cart opens the same drawer as the header's bag button.
 */
export default function BottomNav({ categories }: { categories: Collection[] }) {
  const { bottomNav: t, common, header, collection } = useDictionary();
  const locale = useLocale();
  const pathname = useRoutePath();
  const { cart, isOpen: cartOpen, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useFocusTrap(sheetRef, sheetOpen, closeSheet);

  const isActive: Record<TabKey, boolean> = {
    home: pathname === "/" && !sheetOpen && !cartOpen,
    categories: sheetOpen || (!cartOpen && pathname.startsWith("/collections")),
    account: !sheetOpen && !cartOpen && pathname.startsWith("/account"),
    cart: cartOpen,
  };

  // Shopify's automatic "all products" page first, then the real categories.
  const sheetLinks = [
    { key: ALL_PRODUCTS_HANDLE, title: t.allJewellery, imageUrl: null, imageAlt: "" },
    ...categories.map((category) => ({
      key: category.handle,
      title: category.title,
      imageUrl: category.imageUrl,
      imageAlt: category.imageAlt,
    })),
  ];

  const itemClass = (tab: TabKey) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 font-sans text-xs tracking-wide transition-opacity duration-(--motion-fast) ease-luxury focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-600 ${
      isActive[tab] ? "font-semibold text-gold-600" : "text-brown-900/50"
    }`;
  const iconClass = (tab: TabKey) =>
    `h-[26px] w-[26px] transition-transform duration-(--motion-fast) ease-luxury ${
      isActive[tab] ? "scale-105" : ""
    }`;

  return (
    <>
      {/* z-30, under the sticky header (z-40): the header's stacking context also
          holds the cart drawer and mobile menu, which must cover this bar. */}
      <nav
        aria-label={t.label}
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-black/[0.08] bg-white pt-2.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden"
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
          onClick={() => setSheetOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className={itemClass("categories")}
        >
          <NavIcon name="categories" tinted className={iconClass("categories")} />
          {t.categories}
        </button>

        <Link
          href="/account"
          aria-current={pathname.startsWith("/account") ? "page" : undefined}
          className={itemClass("account")}
        >
          <NavIcon name="account" tinted className={iconClass("account")} />
          {t.account}
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-haspopup="dialog"
          aria-label={formatMessage(header.bagLabel, {
            count: pluralize(locale, itemCount, header.items),
          })}
          className={itemClass("cart")}
        >
          <span className="relative flex">
            <NavIcon name="cart" tinted className={iconClass("cart")} />
            {itemCount > 0 && <CountBadge count={itemCount} />}
          </span>
          {t.cart}
        </button>
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
          aria-label={collection.shopByCategory}
          className={`absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-3xl bg-cream-50 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-luxury ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between px-(--page-gutter) py-3">
            <h2 className="font-sans text-lg font-medium text-gold-600">{t.sheetTitle}</h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={t.closeSheet}
              className="-me-2 flex h-11 w-11 items-center justify-center rounded-full"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <ul className="grid grid-cols-2 gap-3 overflow-y-auto px-(--page-gutter) pb-5">
            {sheetLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={`/collections/${link.key}`}
                  onClick={closeSheet}
                  className="flex h-full flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm active:scale-[0.98]"
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-cream-100">
                    {link.imageUrl ? (
                      <Image
                        src={getShopifyImageUrl(link.imageUrl, CATEGORY_IMAGE_WIDTH)}
                        alt={link.imageAlt}
                        fill
                        sizes="(min-width: 640px) 25vw, 45vw"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        className="object-cover"
                      />
                    ) : (
                      // "All Jewellery" isn't a collection with a photo of its own.
                      <Image
                        src="/brand/icons/nav/categories.webp"
                        alt=""
                        width={40}
                        height={40}
                        className="absolute inset-0 m-auto h-10 w-10 opacity-60"
                      />
                    )}
                  </span>
                  <span dir="auto" className="font-sans text-sm font-medium leading-snug text-brown-900">
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
