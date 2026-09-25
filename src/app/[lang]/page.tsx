import Hero from "@/components/home/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturesBar from "@/components/home/FeaturesBar";
import ProductGridSection, { type ProductTab } from "@/components/home/ProductGridSection";
import AtelierSection from "@/components/home/AtelierSection";
import ShopByOccasionSection from "@/components/home/ShopByOccasionSection";
import CustomerReviews from "@/components/home/CustomerReviews";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import {
  filterProducts,
  getCollectionGroups,
  getHeroBanners,
  getCollectionProducts,
  getLatestReviews,
  getOccasions,
  getProducts,
  getTestimonials,
} from "@/services/shopify";
import { getDictionary, type Dictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { localeAlternates } from "@/utils/seo";
import type { Metadata } from "next";
import type { Product } from "@/types/product";
import {
  ATELIER_COLLECTION_HANDLE,
  MASTERPIECES_COLLECTION_HANDLE,
  SHOP_BY_CATEGORY_HANDLES,
} from "@/config/catalog";

/** Each tab is backed by real Shopify data — a price filter or an existing
 * collection (any collection handle works; products and their order are
 * managed in Admin → Products → Collections). A tab with nothing in it
 * honestly shows "no products match" rather than faking a result. */
const masterpieceTabs = (t: Dictionary["home"]["masterpieces"]["tabs"]): ProductTab[] => [
  { label: t.all, mode: "initial" },
  { label: t.under5000, mode: "query", query: "variants.price:<5000" },
  { label: t.solitaires, mode: "collection", handle: "solitaire" },
  { label: t.everyday, mode: "collection", handle: "everyday-luxury" },
];

const TRENDING_TAB_SIZE = 12;

/** The three tabs are the merchant's Shopify tags (Admin → Products → Tags) —
 * the same ones as the collection page's quick filters. A product can carry
 * several tags, so each is shown in only one tab: Best Sellers (the scarcest
 * tag) claims first, then New Arrivals, then Trending; a tab whose tag has no
 * products left shows the empty state. Pools are larger than a tab so
 * removing overlaps still leaves a full row. */
function trendingTabs(
  t: Dictionary["home"]["trending"]["tabs"],
  pools: { newArrivals: Product[]; bestSellers: Product[]; trending: Product[] },
): ProductTab[] {
  const claimed = new Set<string>();
  const take = (pool: Product[]) => {
    const picked = pool.filter((product) => !claimed.has(product.id)).slice(0, TRENDING_TAB_SIZE);
    picked.forEach((product) => claimed.add(product.id));
    return picked;
  };
  const bestSellers = take(pools.bestSellers);
  const newArrivals = take(pools.newArrivals);
  const trending = take(pools.trending);
  return [
    { label: t.newArrivals, mode: "products", products: newArrivals },
    { label: t.bestSellers, mode: "products", products: bestSellers },
    { label: t.uaeGifts, mode: "products", products: trending },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: localeAlternates("/", await getLocale()) };
}

/** The homepage is statically generated; its shelves refresh on this
 * schedule (a full-page regeneration each minute would be wasted work). */
const HOME_REVALIDATE_SECONDS = 600;

export default async function Home() {
  const locale = await getLocale();
  const { home: t } = await getDictionary(locale);
  const [products, newArrivalPool, bestSellerPool, trendingPool, signatureProducts, collections, heroBanners, occasions, testimonials, reviews] =
    await Promise.all([
      getProducts({ first: 8, revalidate: HOME_REVALIDATE_SECONDS, locale }),
      // Tag pools for the Trending Now tabs (see trendingTabs).
      filterProducts({ query: 'tag:"New Arrival"', first: 30, revalidate: HOME_REVALIDATE_SECONDS, locale }),
      filterProducts({ query: "tag:Bestseller", first: 30, revalidate: HOME_REVALIDATE_SECONDS, locale }),
      filterProducts({ query: "tag:Trending", first: 30, revalidate: HOME_REVALIDATE_SECONDS, locale }),
      // A curation problem must not take the homepage down — fall back to best sellers.
      getCollectionProducts({
        handle: MASTERPIECES_COLLECTION_HANDLE,
        revalidate: HOME_REVALIDATE_SECONDS,
        locale,
      }).catch(() => []),
      getCollectionGroups(
        {
          categories: SHOP_BY_CATEGORY_HANDLES,
          atelier: [ATELIER_COLLECTION_HANDLE],
        },
        locale,
      ),
      getHeroBanners({ locale }),
      getOccasions({ locale }),
      getTestimonials({ locale }),
      // A reviews outage must not take the homepage down.
      getLatestReviews({ locale }).catch((error) => {
        console.error("Failed to load homepage reviews", error);
        return [];
      }),
    ]);

  const { categories, atelier: [atelierCollection] } = collections;

  return (
    <>
      <Hero banners={heroBanners} />
      <CategoryStrip categories={categories} />
      <FeaturesBar />
      <ProductGridSection
        eyebrow={t.trending.eyebrow}
        title={t.trending.title}
        tabs={trendingTabs(t.trending.tabs, {
          newArrivals: newArrivalPool,
          bestSellers: bestSellerPool,
          trending: trendingPool,
        })}
        products={[]}
        tightOnPhone
      />
      <AtelierSection
        image={
          atelierCollection?.imageUrl
            ? { url: atelierCollection.imageUrl, alt: atelierCollection.imageAlt }
            : null
        }
      />
      <ShopByOccasionSection occasions={occasions} />
      <ProductGridSection
        eyebrow={t.masterpieces.eyebrow}
        title={t.masterpieces.title}
        tabs={masterpieceTabs(t.masterpieces.tabs)}
        products={signatureProducts.length > 0 ? signatureProducts : products.slice(0, 4)}
      />
      <CustomerReviews reviews={reviews} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  );
}
