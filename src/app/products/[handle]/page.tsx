import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGallery from "@/components/ui/ProductGallery";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import RelatedProducts, { RelatedProductsSkeleton } from "@/components/ui/RelatedProducts";
import ProductFeatures from "@/components/ui/ProductFeatures";
import ProductInfo from "@/components/ui/ProductInfo";
import ProductActionsRow from "@/components/ui/ProductActionsRow";
import { getProductByHandle } from "@/services/shopify";
import { getProductBadge } from "@/utils/product-badge";

type PageParams = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found | Jawhara Jewellery" };
  }

  return {
    title: `${product.title} | Jawhara Jewellery`,
    description: product.description || `Shop ${product.title} at Jawhara Jewellery.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.image ? [{ url: product.image.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  const badge = getProductBadge(product.tags);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: product.image.url }),
    offers: {
      "@type": "Offer",
      priceCurrency: product.price.currencyCode,
      price: product.price.amount,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <section className="mx-auto max-w-8xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...product.breadcrumb.map((crumb) => ({
              label: crumb.title,
              href: `/collections/${crumb.handle}`,
            })),
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <ProductGallery images={product.images} title={product.title} badge={badge} />

          <div>
            <ProductInfo product={product} />

            <div className="mt-6">
              <ProductActionsRow product={product} />
            </div>

            <div className="mt-6">
              <ProductFeatures />
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={product.id} />
      </Suspense>
      <RecentlyViewed currentProductId={product.id} />
    </>
  );
}
