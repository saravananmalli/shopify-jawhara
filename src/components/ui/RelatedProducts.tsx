import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductShelf from "@/components/ui/ProductShelf";
import { ProductCarouselSkeleton } from "@/components/ui/Skeleton";
import { getDictionary } from "@/dictionaries";
import { getRelatedProducts } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";

export default async function RelatedProducts({ productId }: { productId: string }) {
  const locale = await getLocale();
  let products;
  try {
    products = await getRelatedProducts(productId, { locale });
  } catch (error) {
    // A failed secondary shelf shouldn't take the whole product page down
    // with it (error.tsx would replace the page, buy button included).
    console.error("Failed to load related products", error);
    return null;
  }
  if (products.length === 0) return null;
  const { product } = await getDictionary(locale);

  return (
    <ProductShelf title={product.youMayAlsoLike}>
      <ProductCarousel products={products} />
    </ProductShelf>
  );
}

export function RelatedProductsSkeleton({ title, label }: { title: string; label: string }) {
  return (
    <ProductShelf title={title}>
      <ProductCarouselSkeleton label={label} />
    </ProductShelf>
  );
}
