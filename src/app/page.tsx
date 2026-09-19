import Hero from "@/components/home/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturesBar from "@/components/home/FeaturesBar";
import ProductGridSection, { type ProductTab } from "@/components/home/ProductGridSection";
import HorlogerieSection from "@/components/home/HorlogerieSection";
import ShopByOccasionSection from "@/components/home/ShopByOccasionSection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import {
  getCollectionByHandle,
  getCollectionsByHandles,
  getHeroBanners,
  getOccasions,
  getProducts,
  getTestimonials,
} from "@/services/shopify";

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

export default async function Home() {
  const [products, categories, heroBanners, horlogerieCollection, occasions, testimonials] = await Promise.all([
    getProducts({ first: 8 }),
    getCollectionsByHandles(SHOP_BY_CATEGORY_HANDLES),
    getHeroBanners(),
    getCollectionByHandle("horlogerie"),
    getOccasions(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero banners={heroBanners} />
      <CategoryStrip categories={categories} />
      <FeaturesBar />
      <ProductGridSection
        eyebrow="Haute Vitrine"
        title="Bestselling Creations in UAE"
        subtitle="GIA certified natural solitaires and Bareeq hallmarked 18K/22K heirloom pieces."
        tabs={MASTERPIECE_TABS}
        products={products.slice(0, 4)}
      />
      <HorlogerieSection
        image={
          horlogerieCollection?.imageUrl
            ? { url: horlogerieCollection.imageUrl, alt: horlogerieCollection.imageAlt }
            : null
        }
      />
      <ShopByOccasionSection occasions={occasions} />
      <ProductGridSection
        eyebrow="Haute Vitrine"
        title="Bestselling Creations in UAE"
        subtitle="GIA certified natural solitaires and Bareeq hallmarked 18K/22K heirloom pieces."
        tabs={TRENDING_TABS}
        products={products.slice(-4)}
      />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  );
}
