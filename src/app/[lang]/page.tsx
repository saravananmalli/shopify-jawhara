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

const trendingTabs = (t: Dictionary["home"]["trending"]["tabs"]): ProductTab[] => [
  { label: t.newArrivals, mode: "sort", sortKey: "CREATED_AT" },
  { label: t.bestSellers, mode: "sort", sortKey: "BEST_SELLING" },
  { label: t.uaeGifts, mode: "query", query: "tag:trending" },
];

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: localeAlternates("/", await getLocale()) };
}

/** The homepage is statically generated; its shelves refresh on this
 * schedule (a full-page regeneration each minute would be wasted work). */
const HOME_REVALIDATE_SECONDS = 600;

export default async function Home() {
  const locale = await getLocale();
  const { home: t } = await getDictionary(locale);
  const [products, signatureProducts, collections, heroBanners, occasions, testimonials, reviews] =
    await Promise.all([
      getProducts({ first: 8, revalidate: HOME_REVALIDATE_SECONDS, locale }),
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
        eyebrow={t.masterpieces.eyebrow}
        title={t.masterpieces.title}
        subtitle={t.masterpieces.subtitle}
        tabs={masterpieceTabs(t.masterpieces.tabs)}
        products={signatureProducts.length > 0 ? signatureProducts : products.slice(0, 4)}
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
        eyebrow={t.trending.eyebrow}
        title={t.trending.title}
        subtitle={t.trending.subtitle}
        tabs={trendingTabs(t.trending.tabs)}
        products={products.slice(-4)}
      />
      <CustomerReviews reviews={reviews} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  );
}
