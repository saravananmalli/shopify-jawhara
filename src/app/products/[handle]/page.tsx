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
import ProductReviews, { ProductReviewsSkeleton } from "@/components/ui/ProductReviews";
import { getProductByHandle } from "@/services/shopify";
import { serializeJsonLd } from "@/utils/json-ld";
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

  // Already on the product (Judge.me's metafields) — no second round trip.
  const ratingSummary = product.rating;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: product.image.url }),
    ...(ratingSummary && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingSummary.average,
        reviewCount: ratingSummary.count,
      },
    }),
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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
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

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <ProductGallery images={product.images} title={product.title} badge={badge} />

          <div>
            <ProductInfo product={product} rating={ratingSummary} />

            <div className="mt-6">
              <ProductActionsRow product={product} />
            </div>

            <div className="mt-6">
              <ProductFeatures />
            </div>
          </div>
        </div>
      </section>

      {ratingSummary && (
        <Suspense fallback={<ProductReviewsSkeleton />}>
          <ProductReviews productId={product.id} summary={ratingSummary} />
        </Suspense>
      )}

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={product.id} />
      </Suspense>
      <RecentlyViewed currentProductId={product.id} />
    </>
  );
}
