"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { useRoutePath } from "@/hooks/useRoutePath";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMessage, pluralize } from "@/utils/i18n";
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  BagIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLazyDialog } from "@/hooks/useLazyDialog";
import { AnnouncementTicker, SearchHint } from "@/components/layout/HeaderTickers";
import MegaMenuItem from "@/components/layout/MegaMenuItem";
import JewelleryMegaMenu from "@/components/layout/JewelleryMegaMenu";
import GiftsMegaMenu from "@/components/layout/GiftsMegaMenu";
import OurCollectionsMegaMenu from "@/components/layout/OurCollectionsMegaMenu";
import ImageCategoryMegaMenu from "@/components/layout/ImageCategoryMegaMenu";
import MobileNavItem from "@/components/layout/MobileNavItem";
import { useDelivery, useLocationUi } from "@/store/delivery";
import { getShopifyImageUrl, isUntrustedRemoteImage } from "@/utils/shopify-image";
import type { Brand, Collection, NavLink } from "@/types/content";

// Dialogs nobody sees on first paint: loaded on first open (or on hover/focus
// of their trigger) rather than shipped in every page's initial JS.
const loadCartDrawer = () => import("@/components/layout/CartDrawer");
const loadSearchOverlay = () => import("@/components/layout/SearchOverlay");
const loadLocationModal = () => import("@/components/layout/LocationModal");
const CartDrawer = dynamic(loadCartDrawer);
const SearchOverlay = dynamic(loadSearchOverlay);
const LocationModal = dynamic(loadLocationModal);

// 2x the rendered logo size (desktop 150x70, mobile drawer 110x51).
const LOGO_IMAGE_WIDTH_DESKTOP = 320;
const LOGO_IMAGE_WIDTH_MOBILE = 192;

const FALLBACK_LOGO = "/brand/jawhara-logo.png";

export default function Header({
  brand,
  navLinks,
  giftsPromoCollection,
  goldCategories,
  diamondCategories,
  pearlCategories,
}: {
  brand: Brand;
  navLinks: NavLink[];
  giftsPromoCollection: Collection | null;
  goldCategories: Collection[];
  diamondCategories: Collection[];
  pearlCategories: Collection[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { cart, isOpen: cartOpen, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const locale = useLocale();
  const t = useDictionary();
  // The URL carries the language prefix (/ar/...); route checks below are on
  // the unprefixed path.
  const pathname = useRoutePath();
  const { emirate, setEmirate } = useDelivery();
  const {
    open: locationOpen,
    openPicker: openLocation,
    closePicker: closeLocation,
    detectLocation,
  } = useLocationUi();
  const [searchOpen, setSearchOpen] = useState(false);

  // Stable identities: useFocusTrap re-runs (and re-focuses) when onClose changes.
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useFocusTrap(mobileMenuRef, mobileOpen, closeMobileMenu);

  const cartDialog = useLazyDialog(cartOpen);
  const searchDialog = useLazyDialog(searchOpen);
  const locationDialog = useLazyDialog(locationOpen);

  // Used only if the "main-menu" handle doesn't exist in Shopify Admin yet.
  const links: NavLink[] =
    navLinks.length > 0
      ? navLinks
      : [{ key: "all products", title: t.header.fallbackAllProducts, url: "/collections/all", items: [] }];
  const itemsLabel = (count: number) => pluralize(locale, count, t.header.items);
  const logoSrc = brand.logoUrl ?? FALLBACK_LOGO;

  return (
    <header
      className={`z-40 bg-cream-50 ${
        // Collection pages pin their own filter bar instead of the header.
        pathname === "/collections" || pathname.startsWith("/collections/")
          ? "relative"
          : "sticky top-0"
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden bg-gradient-to-r from-gold-700 via-gold-600 to-gold-700 px-4 py-2 text-[12px] tracking-[1.1px] text-cream-50 sm:block">
        <div className="mx-auto flex max-w-8xl items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG; matches the FeaturesBar convention. */}
            <img src="/brand/icons/badge-white.svg" alt="" aria-hidden className="h-6 w-6" />
            {t.header.heritage}
          </span>
          <AnnouncementTicker />
          <span className="flex items-center gap-3">
            <Link href="/stores" className="flex items-center gap-1.5">
              <Image
                src="/brand/icons/store.webp"
                alt=""
                width={14}
                height={14}
                className="h-3.5 w-3.5 brightness-0 invert"
              />
              {t.header.stores}
            </Link>
            <span className="h-3 w-px bg-cream-50/40" aria-hidden />
            <LanguageSwitcher className="font-medium hover:underline" />
          </span>
        </div>
      </div>

      {/* Main row: search / logo / account */}
      <div className="border-b border-gold-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t.header.openMenu}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="hidden flex-1 items-center gap-3 lg:flex">
            <button
              onClick={openLocation}
              onPointerEnter={loadLocationModal}
              onFocus={loadLocationModal}
              className="flex shrink-0 items-center gap-0 px-1 py-1 text-gold-600 hover:text-gold-700"
            >
              <Image
                src="/brand/icons/location.webp"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 shrink-0"
              />
              <span className="flex flex-col items-start gap-1 text-start">
                <span className="font-sans text-[10px] font-semibold uppercase leading-none tracking-widest text-gold-800">
                  {t.header.deliverTo}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold leading-none">
                  {emirate
                    ? formatMessage(t.header.emirateUae, {
                        emirate:
                          (t.delivery.emirates as Record<string, string>)[emirate] ?? emirate,
                      })
                    : t.header.selectLocation}
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-brown-900/50" />
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              onPointerEnter={loadSearchOverlay}
              onFocus={loadSearchOverlay}
              className="flex w-full max-w-52 items-center gap-1.5 overflow-hidden rounded-full border border-gold-100 bg-white px-3 py-1.5 text-start"
              aria-haspopup="dialog"
            >
              <SearchIcon className="h-3.5 w-3.5 shrink-0 text-gold-700" />
              <span className="truncate text-sm text-brown-900/40">
                <SearchHint />
              </span>
            </button>
          </div>

          <Link href="/" aria-label={formatMessage(t.header.homeLabel, { brand: brand.name })}>
            <Image
              src={getShopifyImageUrl(logoSrc, LOGO_IMAGE_WIDTH_DESKTOP)}
              alt={brand.logoAlt}
              width={150}
              height={70}
              priority
              unoptimized={isUntrustedRemoteImage(logoSrc)}
              className="h-16 w-auto"
            />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5 text-sm">
            <Link
              href="/account"
              className="hidden items-center gap-1.5 sm:flex"
            >
              <UserIcon className="h-5 w-5" />
              {t.header.logIn}
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden sm:block"
              aria-label={formatMessage(t.header.wishlistLabel, { count: itemsLabel(wishlistCount) })}
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-600 text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              onPointerEnter={loadCartDrawer}
              onFocus={loadCartDrawer}
              className="flex items-center gap-2"
              aria-label={formatMessage(t.header.bagLabel, { count: itemsLabel(itemCount) })}
            >
              <span className="relative">
                <BagIcon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-600 text-[10px] text-white">
                    {itemCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="relative hidden border-b border-gold-100 bg-cream-200/80 px-4 lg:block">
        <ul className="mx-auto flex max-w-8xl flex-wrap items-center gap-6 py-3 text-[13px] font-medium tracking-[1.4px] text-brown-900">
          {links.map((link, index) => {
            const title = link.key;
            const key = `${link.title}-${index}`;
            const isActive = pathname === link.url;

            if (title === "jewellery") {
              return <JewelleryMegaMenu key={key} link={link} isActive={isActive} />;
            }
            if (title === "gifts") {
              return (
                <GiftsMegaMenu
                  key={key}
                  link={link}
                  isActive={isActive}
                  promoCollection={giftsPromoCollection}
                />
              );
            }
            if (title === "our collections") {
              return <OurCollectionsMegaMenu key={key} link={link} isActive={isActive} />;
            }
            if (title === "gold") {
              return (
                <ImageCategoryMegaMenu
                  key={key}
                  link={link}
                  isActive={isActive}
                  categories={goldCategories}
                />
              );
            }
            if (title === "diamonds") {
              return (
                <ImageCategoryMegaMenu
                  key={key}
                  link={link}
                  isActive={isActive}
                  categories={diamondCategories}
                />
              );
            }
            if (title === "pearls") {
              return (
                <ImageCategoryMegaMenu
                  key={key}
                  link={link}
                  isActive={isActive}
                  categories={pearlCategories}
                />
              );
            }
            return <MegaMenuItem key={key} link={link} isActive={isActive} />;
          })}
          <li className="ms-auto flex items-center gap-1.5 whitespace-nowrap text-gold-700">
            {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG; matches the FeaturesBar convention. */}
            <img src="/brand/icons/badge-primary.svg" alt="" aria-hidden className="h-6 w-6" />
            {t.header.heritage}
          </li>
        </ul>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ease-luxury lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={closeMobileMenu}
        />
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.header.siteNavigation}
          className={`relative flex h-full w-80 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-cream-50 p-5 transition-transform duration-300 ease-luxury ${
            mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Image
              src={getShopifyImageUrl(logoSrc, LOGO_IMAGE_WIDTH_MOBILE)}
              alt={brand.logoAlt}
              width={110}
              height={51}
              unoptimized={isUntrustedRemoteImage(logoSrc)}
              className="h-10 w-auto"
            />
            <button onClick={() => setMobileOpen(false)} aria-label={t.header.closeMenu}>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="flex items-center gap-2 overflow-hidden rounded-full border border-gold-100 bg-white px-4 py-2 text-start"
            aria-haspopup="dialog"
          >
            <SearchIcon className="h-4 w-4 shrink-0 text-gold-700" />
            <span className="truncate text-sm text-brown-900/40">
              <SearchHint />
            </span>
          </button>
          <ul className="flex flex-col gap-1 text-sm">
            {links.map((link, index) => (
              <MobileNavItem
                key={`${link.title}-${index}`}
                link={link}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </ul>
          <div className="mt-auto border-t border-gold-100 pt-4 text-sm">
            <LanguageSwitcher className="font-medium text-gold-700" />
          </div>
        </div>
      </div>

      {searchDialog.mounted && (
        <SearchOverlay
          open={searchDialog.visible}
          onClose={closeSearch}
        />
      )}
      {cartDialog.mounted && <CartDrawer visible={cartDialog.visible} />}
      {locationDialog.mounted && (
        <LocationModal
          open={locationDialog.visible}
          onClose={closeLocation}
          selected={emirate}
          onSelect={setEmirate}
          onDetect={detectLocation}
        />
      )}
    </header>
  );
}
