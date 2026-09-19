import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductInfo from "@/components/ui/ProductInfo";
import ProductActionsRow from "@/components/ui/ProductActionsRow";
import { getProductByHandle } from "@/services/shopify";
import type { ProductDetail } from "@/types/product";

type PageParams = { params: Promise<{ handle: string }> };

/** Real product tags → an image-overlay badge. Add more as the merchandising
 * team starts using new tags — nothing shows for a product with none of these. */
const TAG_BADGES: Record<string, string> = {
  bestseller: "Dubai Bestseller",
  "flagship-exclusive": "Dubai Flagship Exclusive",
};

function getBadge(tags: string[]): string | null {
  for (const tag of tags) {
    const label = TAG_BADGES[tag.toLowerCase()];
    if (label) return label;
  }
  return null;
}

/** Icon + label + value — only the specs a product actually has filled in
 * (Shopify Admin → Settings → Custom data → Products, namespace "custom"). */
function getSpecEntries(specifications: ProductDetail["specifications"]) {
  return [
    { icon: "/brand/icons/brand.svg", label: "Collection", value: specifications.brand },
    { icon: "/brand/icons/sku.svg", label: "SKU", value: specifications.sku },
    { icon: "/brand/icons/metal-type.svg", label: "Metal Type", value: specifications.metalType },
    { icon: "/brand/icons/diamond-clarity.svg", label: "Diamond Clarity", value: specifications.diamondClarity },
    { icon: "/brand/icons/diamond-color.svg", label: "Diamond Color", value: specifications.diamondColor },
    { icon: "/brand/icons/diamond-ct.svg", label: "Diamond Ct", value: specifications.diamondCt },
    { icon: "/brand/icons/gross-weight.svg", label: "Gross Weight", value: specifications.grossWeight },
    { icon: "/brand/icons/color.svg", label: "Color", value: specifications.color },
  ].filter((entry): entry is { icon: string; label: string; value: string } => Boolean(entry.value));
}

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

  const badge = getBadge(product.tags);
  const specEntries = getSpecEntries(product.specifications);

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
          <ProductInfo product={product} specEntries={specEntries} />

          <div className="mt-6">
            <ProductActionsRow product={product} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icons/free shipping.svg" alt="" aria-hidden className="h-7 w-7" />
              <p className="mt-2 font-sans text-sm font-semibold text-brown-900">
                Free Shipping Across UAE
              </p>
              <p className="mt-1 font-sans text-xs text-brown-900/60">
                No code needed — just add items to your bag and head to checkout.
              </p>
            </div>
            <div className="rounded-2xl border border-gold-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icons/exchnage.svg" alt="" aria-hidden className="h-7 w-7" />
              <p className="mt-2 font-sans text-sm font-semibold text-brown-900">
                Easy 15-Day Exchange
              </p>
              <p className="mt-1 font-sans text-xs text-brown-900/60">
                Changed your mind? No problem — exchange within 15 days.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 font-sans text-xs text-brown-900/60">
            <p className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icons/jewellery certificate.svg" alt="" aria-hidden className="h-4 w-4" />
              Standard delivery within 2–5 business days
            </p>
            <p className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icons/jewellery maintance.svg" alt="" aria-hidden className="h-4 w-4" />
              Return items in original condition for a full refund
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
