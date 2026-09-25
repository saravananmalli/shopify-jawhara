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
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import CountBadge from "@/components/ui/CountBadge";
import DialogOverlay from "@/components/ui/DialogOverlay";
import IconButton from "@/components/ui/IconButton";
import NavIcon from "@/components/ui/NavIcon";
import { shopifyConfig } from "@/config/shopify";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLazyDialog } from "@/hooks/useLazyDialog";
import { AnnouncementTicker, SearchHint } from "@/components/layout/HeaderTickers";
import MegaMenuItem from "@/components/layout/MegaMenuItem";
import JewelleryMegaMenu from "@/components/layout/JewelleryMegaMenu";
import GiftsMegaMenu from "@/components/layout/GiftsMegaMenu";
import OurCollectionsMegaMenu from "@/components/layout/OurCollectionsMegaMenu";
import ImageCategoryMegaMenu from "@/components/layout/ImageCategoryMegaMenu";
import MobileNavItem from "@/components/layout/MobileNavItem";
import NavMenuProvider from "@/components/layout/NavMenuProvider";
import { useDelivery, useLocationUi } from "@/store/delivery";
import { getShopifyImageUrl, isUntrustedRemoteImage } from "@/utils/shopify-image";
import type { Brand, Collection, NavLink } from "@/types/content";
import { isNavLinkActive, NAV_ACTIVE_TEXT } from "@/utils/nav";

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

const HERITAGE_PATH = "/pages/heritage-since-1907";

export default function Header({
  brand,
  navLinks,
  giftsPromoCollection,
  goldCategories,
  diamondCategories,
  pearlCategories,
  kidsCategories,
}: {
  brand: Brand;
  navLinks: NavLink[];
  giftsPromoCollection: Collection | null;
  goldCategories: Collection[];
  diamondCategories: Collection[];
  pearlCategories: Collection[];
  kidsCategories: Collection[];
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
  const deliveryLabel = emirate
    ? formatMessage(t.header.emirateUae, {
        emirate: (t.delivery.emirates as Record<string, string>)[emirate] ?? emirate,
      })
    : t.header.selectLocation;
  const logoSrc = brand.logoUrl ?? FALLBACK_LOGO;

  return (
    <header
      className={`sticky top-(--header-top) z-40 bg-cream-50 transition-[top] duration-300 ease-luxury ${
        // On desktop, collection pages pin their own filter bar instead of the
        // header. On phones the header is sticky everywhere so it can slide
        // back in on scroll up.
        pathname === "/collections" || pathname.startsWith("/collections/")
          ? "md:relative"
          : ""
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden bg-gradient-to-r from-gold-700 via-gold-600 to-gold-700 py-1.5 text-[12px] tracking-[1.1px] text-cream-50 sm:block">
        <div className="page-container flex items-center justify-between">
          {/* The heritage line lives in the category nav (xl) and the mobile menu. */}
          <Link href="/customer-service" className="flex items-center gap-1.5 font-medium hover:underline">
            <NavIcon name="support" tinted className="h-4 w-4" />
            {t.header.customerService}
          </Link>
          <AnnouncementTicker />
          <span className="flex items-center gap-3">
            <Link href="/stores" className="flex items-center gap-1.5 hover:underline">
              <Image
                src="/brand/icons/store.webp"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 brightness-0 invert"
              />
              {t.header.stores}
            </Link>
            <span className="h-3 w-px bg-cream-50/40" aria-hidden />
            <LanguageSwitcher className="font-medium hover:underline" />
          </span>
        </div>
      </div>

      {/* Main row: search / logo / account */}
      <div className="border-b border-gold-100 bg-white py-2">
        <div className="page-container flex items-center justify-between gap-4">
          {/* flex-1 like the right-hand cluster, so the logo sits centred. */}
          <div className="flex flex-1 lg:hidden">
            <IconButton
              icon={<MenuIcon className="h-6 w-6" />}
              aria-label={t.header.openMenu}
              onClick={() => setMobileOpen(true)}
              rounded={false}
              hoverTone="none"
              className="-ms-2"
            />
          </div>

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
                  {deliveryLabel}
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-brown-900/50" />
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              onPointerEnter={loadSearchOverlay}
              onFocus={loadSearchOverlay}
              className="flex w-full max-w-64 items-center gap-1.5 overflow-hidden rounded-full border border-gold-100 bg-white px-3 py-1.5 text-start"
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
              className="h-12 w-auto sm:h-16 [@media(min-width:1024px)_and_(max-height:800px)]:h-14"
            />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-0 text-sm sm:gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              onPointerEnter={loadSearchOverlay}
              onFocus={loadSearchOverlay}
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-haspopup="dialog"
              aria-label={t.search.label}
            >
              <NavIcon name="search" tinted className="h-6 w-6" />
            </button>
            {/* Shopify-hosted customer account, so a plain <a> (not our locale Link). */}
            <a
              href={shopifyConfig.accountUrl}
              className="hidden items-center gap-1.5 sm:flex"
            >
              <NavIcon name="account" className="h-6 w-6" />
              {t.header.logIn}
            </a>
            <Link
              href="/wishlist"
              className="flex h-10 w-10 items-center justify-center sm:h-auto sm:w-auto"
              aria-label={formatMessage(t.header.wishlistLabel, { count: itemsLabel(wishlistCount) })}
            >
              <span className="relative">
                <NavIcon name="wishlist" className="h-6 w-6" />
                {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
              </span>
            </Link>
            <button
              onClick={openCart}
              onPointerEnter={loadCartDrawer}
              onFocus={loadCartDrawer}
              className="-me-2 flex h-10 w-10 items-center justify-center gap-2 lg:me-0 lg:h-auto lg:w-auto"
              aria-label={formatMessage(t.header.bagLabel, { count: itemsLabel(itemCount) })}
            >
              <span className="relative">
                <NavIcon name="cart" className="h-6 w-6" />
                {itemCount > 0 && <CountBadge count={itemCount} />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Delivery location and language on their own row below lg, where the
          main row has no room for them. The language pill is phone-only: from
          sm the gold utility bar above carries it. */}
      <div className="border-b border-gold-100 bg-cream-200/80 lg:hidden">
        <div className="page-container flex items-center justify-between gap-3 py-1.5 max-sm:py-[3px]">
          <button
            type="button"
            onClick={openLocation}
            onPointerEnter={loadLocationModal}
            onFocus={loadLocationModal}
            className="flex min-h-11 min-w-0 items-center text-start text-gold-600 max-sm:min-h-9 hover:text-gold-700"
          >
            <Image
              src="/brand/icons/location.webp"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
            <span className="flex min-w-0 flex-col items-start gap-1 max-sm:gap-px">
              <span className="font-sans text-[10px] font-semibold uppercase leading-none tracking-widest text-gold-800">
                {t.header.deliverTo}
              </span>
              <span className="flex items-center gap-1 text-[13px] font-semibold leading-none sm:text-sm">
                <span className="truncate">{deliveryLabel}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-brown-900/50" />
              </span>
            </span>
          </button>
          <LanguageSwitcher
            showFlag
            className="flex min-h-8 shrink-0 items-center gap-2 px-3 text-sm font-semibold text-brown-900 sm:hidden"
          />
        </div>
      </div>

      {/* Category nav */}
      <nav className="relative hidden border-b border-gold-100 bg-cream-200/80 lg:block">
        <NavMenuProvider>
        <ul className="page-container flex flex-wrap items-center gap-x-4 py-3 text-[14px] font-medium tracking-[0.8px] text-brown-900 xl:gap-x-6 xl:tracking-[1.4px]">
          {links.map((link, index) => {
            const title = link.key;
            const key = `${link.title}-${index}`;
            const isActive = isNavLinkActive(link, pathname);

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
            if (title === "kids") {
              return (
                <ImageCategoryMegaMenu
                  key={key}
                  link={link}
                  isActive={isActive}
                  categories={kidsCategories}
                />
              );
            }
            return <MegaMenuItem key={key} link={link} isActive={isActive} />;
          })}
          <li className="ms-auto hidden whitespace-nowrap xl:flex">
            <Link
              href="/pages/heritage-since-1907"
              aria-current={pathname === HERITAGE_PATH ? "page" : undefined}
              className={`flex items-center gap-1.5 transition-colors duration-(--motion-fast) hover:text-gold-600 ${
                pathname === HERITAGE_PATH ? NAV_ACTIVE_TEXT : "text-gold-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG; matches the FeaturesBar convention. */}
              <img src="/brand/icons/badge-primary.svg" alt="" aria-hidden className="h-5 w-5" />
              {t.header.heritage}
            </Link>
          </li>
        </ul>
        </NavMenuProvider>
      </nav>

      {/* Mobile menu */}
      <DialogOverlay visible={mobileOpen} onClose={closeMobileMenu} className="flex lg:hidden">
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.header.siteNavigation}
          className={`relative flex h-full w-80 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-cream-50 p-5 transition-transform duration-300 ease-luxury ${
            mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between">
            <Image
              src={getShopifyImageUrl(logoSrc, LOGO_IMAGE_WIDTH_MOBILE)}
              alt={brand.logoAlt}
              width={110}
              height={51}
              unoptimized={isUntrustedRemoteImage(logoSrc)}
              className="h-10 w-auto"
            />
            <IconButton
              icon={<CloseIcon className="h-5 w-5" />}
              aria-label={t.header.closeMenu}
              onClick={() => setMobileOpen(false)}
              rounded={false}
              hoverTone="none"
              className="-me-2"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border border-gold-100 bg-white px-4 py-2 text-start"
            aria-haspopup="dialog"
          >
            <SearchIcon className="h-4 w-4 shrink-0 text-gold-700" />
            <span className="truncate text-sm text-brown-900/40">
              <SearchHint />
            </span>
          </button>
          <ul className="flex shrink-0 flex-col gap-1 text-sm">
            {links.map((link, index) => (
              <MobileNavItem
                key={`${link.title}-${index}`}
                link={link}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </ul>
          <div className="flex shrink-0 flex-col border-t border-gold-100 pt-2 text-sm max-sm:border-t-0 max-sm:pt-0">
            <Link
              href="/pages/heritage-since-1907"
              onClick={() => setMobileOpen(false)}
              aria-current={pathname === HERITAGE_PATH ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2 text-xs font-medium tracking-wide ${
                pathname === HERITAGE_PATH ? NAV_ACTIVE_TEXT : "text-gold-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVG; matches the FeaturesBar convention. */}
              <img src="/brand/icons/badge-primary.svg" alt="" aria-hidden className="h-5 w-5" />
              {t.header.heritage}
            </Link>
            <Link
              href="/stores"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center gap-2 font-medium text-gold-700 sm:hidden"
            >
              <Image
                src="/brand/icons/store.webp"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              {t.header.stores}
            </Link>
          </div>
          <div className="mt-auto shrink-0 border-t border-gold-100 pt-4 text-sm">
            <LanguageSwitcher className="font-medium text-gold-700" />
          </div>
        </div>
      </DialogOverlay>

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
