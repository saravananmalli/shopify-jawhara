import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductShelf from "@/components/ui/ProductShelf";
import { getRelatedProducts } from "@/services/shopify";

export default async function RelatedProducts({ productId }: { productId: string }) {
  let products;
  try {
    products = await getRelatedProducts(productId);
  } catch (error) {
    // A failed secondary shelf shouldn't take the whole product page down
    // with it (error.tsx would replace the page, buy button included).
    console.error("Failed to load related products", error);
    return null;
  }
  if (products.length === 0) return null;

  return (
    <ProductShelf title="You May Also Like">
      <ProductCarousel products={products} />
    </ProductShelf>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <ProductShelf title="You May Also Like">
      <div role="status" aria-busy="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <span className="sr-only">Loading related products…</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-cream-100" />
        ))}
      </div>
    </ProductShelf>
  );
}
