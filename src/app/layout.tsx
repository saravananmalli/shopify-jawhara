import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/store/cart";
import { WishlistProvider } from "@/store/wishlist";
import {
  DIAMOND_CATEGORY_HANDLES,
  GIFTS_PROMO_HANDLE,
  GOLD_CATEGORY_HANDLES,
  PEARL_CATEGORY_HANDLES,
} from "@/config/catalog";
import { siteUrl } from "@/config/site";
import { getBrand, getCollectionGroups, getMenu } from "@/services/shopify";
import "./globals.css";

// Also backs the `font-serif` utility (aliased to --font-sans in
// globals.css) — every font on the site is Poppins, so italic style is
// loaded here rather than in a second font.
const sans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const title = "Jawhara Jewellery | Jewellers Since 1907";
const description =
  "Heritage fine jewellery from Dubai's historic Gold Souk — GIA certified solitaires and 18K/22K heirloom pieces.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [
    brand,
    headerNav,
    footerNav,
    {
      gifts: [giftsPromoCollection = null],
      gold: goldCategories,
      diamond: diamondCategories,
      pearl: pearlCategories,
    },
  ] = await Promise.all([
    getBrand(),
    getMenu("main-menu"),
    getMenu("footer"),
    // One request for every mega-menu collection, not one per handle.
    getCollectionGroups({
      gifts: [GIFTS_PROMO_HANDLE],
      gold: GOLD_CATEGORY_HANDLES,
      diamond: DIAMOND_CATEGORY_HANDLES,
      pearl: PEARL_CATEGORY_HANDLES,
    }),
  ]);

  return (
    <html
      lang="en"
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-brown-900">
        <CartProvider>
          <WishlistProvider>
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
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
