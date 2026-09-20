import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import LocationPrompt from "@/components/layout/LocationPrompt";
import { CartProvider } from "@/store/cart";
import { LocaleProvider } from "@/store/locale";
import { DeliveryProvider } from "@/store/delivery";
import { WishlistProvider } from "@/store/wishlist";
import {
  DIAMOND_CATEGORY_HANDLES,
  GIFTS_PROMO_HANDLE,
  GOLD_CATEGORY_HANDLES,
  PEARL_CATEGORY_HANDLES,
  SHOP_BY_CATEGORY_HANDLES,
} from "@/config/catalog";
import { siteUrl } from "@/config/site";
import { localeConfig, locales } from "@/config/i18n";
import { getLocale } from "@/utils/get-locale";
import { getDictionary } from "@/dictionaries";
import { getBrand, getCollectionGroups, getMenu } from "@/services/shopify";
import "../globals.css";

// Also backs the `font-serif` utility (aliased to --font-sans in
// globals.css) — every Latin glyph on the site is Poppins, so italic style is
// loaded here rather than in a second font. globals.css composes it into
// --font-sans (Arabic first on /ar, where Poppins covers only Latin/digits).
const latin = Poppins({
  variable: "--font-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Geometric Kufi cut to sit next to Poppins. Only referenced when rendering
// /ar, so English pages neither preload nor download it.
const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: meta.siteTitle,
    description: meta.siteDescription,
    icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
    openGraph: {
      title: meta.siteTitle,
      description: meta.siteDescription,
      type: "website",
      locale: localeConfig[locale].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.siteTitle,
      description: meta.siteDescription,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const { dir } = localeConfig[locale];
  const dictionary = await getDictionary(locale);

  const [
    brand,
    headerNav,
    footerNav,
    {
      gifts: [giftsPromoCollection = null],
      gold: goldCategories,
      diamond: diamondCategories,
      pearl: pearlCategories,
      categories: shopCategories,
    },
  ] = await Promise.all([
    getBrand(locale),
    getMenu("main-menu", locale),
    getMenu("footer", locale),
    // One request for every mega-menu collection, not one per handle.
    getCollectionGroups({
      gifts: [GIFTS_PROMO_HANDLE],
      gold: GOLD_CATEGORY_HANDLES,
      diamond: DIAMOND_CATEGORY_HANDLES,
      pearl: PEARL_CATEGORY_HANDLES,
      categories: SHOP_BY_CATEGORY_HANDLES,
    }, locale),
  ]);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${latin.variable} ${locale === "ar" ? arabic.variable : ""} h-full antialiased`}
    >
      {/* Bottom padding keeps the footer clear of the phone tab bar (about 4.25rem tall). */}
      <body className="min-h-full flex flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-brown-900 md:pb-0">
        <LocaleProvider locale={locale} dictionary={dictionary}>
        <CartProvider>
          <WishlistProvider>
            <DeliveryProvider>
              <Header
                brand={brand}
                navLinks={headerNav}
                giftsPromoCollection={giftsPromoCollection}
                goldCategories={goldCategories}
                diamondCategories={diamondCategories}
                pearlCategories={pearlCategories}
              />
              <main className="flex-1">{children}</main>
              <Footer brand={brand} footerNav={footerNav} />
              <LocationPrompt />
              <BottomNav categories={shopCategories} />
            </DeliveryProvider>
          </WishlistProvider>
        </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
