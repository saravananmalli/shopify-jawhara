import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import RelatedProducts, { RelatedProductsSkeleton } from "@/components/ui/RelatedProducts";
import ProductFeatures from "@/components/ui/ProductFeatures";
import ProductMain from "@/components/ui/ProductMain";
import ProductActionsRow from "@/components/ui/ProductActionsRow";
import ProductReviews, { ProductReviewsSkeleton } from "@/components/ui/ProductReviews";
import { getProductByHandle } from "@/services/shopify";
import { serializeJsonLd } from "@/utils/json-ld";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { formatMessage } from "@/utils/i18n";
import { localeAlternates } from "@/utils/seo";
import { getProductBadge } from "@/utils/product-badge";

type PageParams = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const [{ handle }, locale] = await Promise.all([params, getLocale()]);
  const product = await getProductByHandle(handle, locale);
  const { meta } = await getDictionary(locale);

  if (!product) {
    return { title: `${meta.productNotFound} | ${meta.brand}` };
  }

  return {
    title: `${product.title} | ${meta.brand}`,
    description:
      product.description ||
      formatMessage(meta.productDescriptionFallback, { title: product.title, brand: meta.brand }),
    alternates: localeAlternates(`/products/${handle}`, locale),
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.image ? [{ url: product.image.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const [{ handle }, locale] = await Promise.all([params, getLocale()]);
  const product = await getProductByHandle(handle, locale);

  if (!product) notFound();

  const t = await getDictionary(locale);
  const badge = getProductBadge(product.tags, t.product.badges);

  // Already on the product (Judge.me's metafields) — no second round trip.
  const ratingSummary = product.rating;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    inLanguage: locale,
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
      <section className="page-container py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />

        <Breadcrumb
          items={[
            { label: t.common.home, href: "/" },
            ...product.breadcrumb.map((crumb) => ({
              label: crumb.title,
              href: `/collections/${crumb.handle}`,
            })),
            { label: product.title },
          ]}
        />

        <ProductMain product={product} rating={ratingSummary} badge={badge}>
          <div className="mt-6">
            <ProductActionsRow product={product} />
          </div>

          <div className="mt-6">
            <ProductFeatures />
          </div>
        </ProductMain>
      </section>

      {ratingSummary && (
        <Suspense
          fallback={
            <ProductReviewsSkeleton
              title={t.product.reviewsSection.title}
              label={t.common.loadingReviews}
            />
          }
        >
          <ProductReviews productId={product.id} summary={ratingSummary} />
        </Suspense>
      )}

      <Suspense
        fallback={
          <RelatedProductsSkeleton
            title={t.product.youMayAlsoLike}
            label={t.common.loadingRelated}
          />
        }
      >
        <RelatedProducts productId={product.id} />
      </Suspense>
      <RecentlyViewed currentProductId={product.id} />
    </>
  );
}
