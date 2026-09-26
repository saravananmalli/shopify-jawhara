"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductInfo from "@/components/ui/ProductInfo";
import type { ProductDetail, ProductVariant } from "@/types/product";
import type { RatingSummary } from "@/types/review";
import { findVariantByParam } from "@/utils/variant-param";

const subscribeToUrl = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  return () => window.removeEventListener("popstate", notify);
};
const readSearch = () => window.location.search;
// Server and hydration render see no query, so markup matches; the client value follows.
const readServerSearch = () => "";

/**
 * Gallery + info column. The selected variant lives in ProductInfo, but the
 * gallery is its sibling — this wrapper carries the variant's photo across so
 * choosing a colour changes the main image. `children` is the rest of the
 * right-hand column (actions, features), rendered by the server page.
 */
export default function ProductMain({
  product,
  rating,
  badge,
  children,
}: {
  product: ProductDetail;
  rating: RatingSummary | null;
  badge: string | null;
  children: ReactNode;
}) {
  const [focusImageUrl, setFocusImageUrl] = useState<string | null>(null);
  const search = useSyncExternalStore(subscribeToUrl, readSearch, readServerSearch);
  const preferredVariant = useMemo(
    () => findVariantByParam(product.variants, new URLSearchParams(search).get("variant")),
    [product.variants, search],
  );

  const handleVariantChange = (variant: ProductVariant) => {
    if (variant.image) setFocusImageUrl(variant.image.url);
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <ProductGallery
        images={product.images}
        title={product.title}
        badge={badge}
        focusImageUrl={focusImageUrl ?? preferredVariant?.image?.url ?? null}
      />

      <div>
        <ProductInfo
          product={product}
          rating={rating}
          onVariantChange={handleVariantChange}
          preferredVariant={preferredVariant}
        />
        {children}
      </div>
    </div>
  );
}
