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
  getLatestReviews,
  getOccasions,
  getProducts,
  getTestimonials,
} from "@/services/shopify";
import { ATELIER_COLLECTION_HANDLE } from "@/config/catalog";

/** Real Shopify collections powering the homepage "Shop By Category" strip
 * — the plain, material-agnostic collections (not the "Gold Rings" /
 * "Diamond Rings" / "Pearl Rings" material-line variants). */
const SHOP_BY_CATEGORY_HANDLES = [
  "rings",
  "earrings",
  "pendants",
  "necklace",
  "bracelet",
  "bangles",
];

/** Each tab is a real Shopify Storefront search-query filter — tag the
 * matching products in Shopify Admin → Products → [product] → Tags with
 * exactly: "solitaire", "ready-for-hand-delivery", "trending". Until
 * you do, those tabs honestly show "no products match" rather than
 * faking a result. */
const MASTERPIECE_TABS: ProductTab[] = [
  { label: "All Masterpieces", mode: "initial" },
  { label: "Under AED 5,000", mode: "query", query: "variants.price:<5000" },
  { label: "Solitaires", mode: "query", query: "tag:solitaire" },
  { label: "Ready for Hand Delivery", mode: "query", query: "tag:ready-for-hand-delivery" },
];

const TRENDING_TABS: ProductTab[] = [
  { label: "New Arrivals", mode: "sort", sortKey: "CREATED_AT" },
  { label: "Best Sellers", mode: "sort", sortKey: "BEST_SELLING" },
  { label: "Trending UAE Gifts", mode: "query", query: "tag:trending" },
];

/** The homepage is statically generated; its shelves refresh on this
 * schedule (a full-page regeneration each minute would be wasted work). */
const HOME_REVALIDATE_SECONDS = 600;

export default async function Home() {
  const [products, collections, heroBanners, occasions, testimonials, reviews] =
    await Promise.all([
      getProducts({ first: 8, revalidate: HOME_REVALIDATE_SECONDS }),
      getCollectionGroups({
        categories: SHOP_BY_CATEGORY_HANDLES,
        atelier: [ATELIER_COLLECTION_HANDLE],
      }),
      getHeroBanners(),
      getOccasions(),
      getTestimonials(),
      // A reviews outage must not take the homepage down.
      getLatestReviews().catch((error) => {
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
        eyebrow="Haute Vitrine"
        title="Signature Masterpieces"
        subtitle="GIA certified natural solitaires and Bareeq hallmarked 18K/22K heirloom pieces."
        tabs={MASTERPIECE_TABS}
        products={products.slice(0, 4)}
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
        eyebrow="Fresh & Favoured"
        title="Trending Now in the UAE"
        subtitle="New arrivals from our atelier and the pieces our clients are choosing most."
        tabs={TRENDING_TABS}
        products={products.slice(-4)}
      />
      <CustomerReviews reviews={reviews} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  );
}
