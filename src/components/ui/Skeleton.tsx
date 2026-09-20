"use client";

import { useDictionary } from "@/store/locale";
import {
  CATEGORY_TILE_IMAGE_CLASS,
  CATEGORY_TILE_WIDTH_CLASS,
  PRODUCT_CAROUSEL_GAP_CLASS,
  PRODUCT_CAROUSEL_ITEM_CLASS,
  PRODUCT_GRID_CLASS,
} from "@/config/layout";

/**
 * Shared loading placeholders. Each one mirrors the real component's box
 * (same padding, aspect ratio and row heights) so content swaps in without
 * shifting the page. Motion is `animate-pulse`, which the global
 * prefers-reduced-motion rule in globals.css already neutralises.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`animate-pulse rounded bg-cream-100 ${className}`} />
  );
}

/** Announces one "loading" status for a whole skeleton region. */
export function SkeletonRegion({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Same box as ProductCard: 3.5 padding, square photo, price / title / meta rows. */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col rounded-3xl border border-[#E6D7BE]/60 bg-white p-3.5 shadow-sm"
    >
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="mt-4 h-7 w-1/2" />
      <Skeleton className="mt-2 h-[21px] w-4/5" />
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}


export function ProductGridSkeleton({
  count = 8,
  label,
  className = "",
}: {
  count?: number;
  label?: string;
  className?: string;
}) {
  const { common } = useDictionary();

  return (
    <SkeletonRegion label={label ?? common.loadingProducts} className={`${PRODUCT_GRID_CLASS} ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** Row sized like ProductCarousel (2 cards on mobile, 3 on tablet, 4 on desktop). */
export function ProductCarouselSkeleton({ label }: { label?: string }) {
  const { common } = useDictionary();

  return (
    <SkeletonRegion label={label ?? common.loadingProducts} className={`flex ${PRODUCT_CAROUSEL_GAP_CLASS} overflow-hidden pb-2`}>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={`${PRODUCT_CAROUSEL_ITEM_CLASS} shrink-0 ${
            i === 2 ? "hidden md:block" : i === 3 ? "hidden lg:block" : ""
          }`}
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Collection page: category strip, chip row, filter toolbar, product grid. */
export function CollectionPageSkeleton() {
  const { common } = useDictionary();

  return (
    <div className="bg-cream-50">
      <SkeletonRegion label={common.loadingCollection} className="page-container pb-16 pt-3">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${CATEGORY_TILE_WIDTH_CLASS} shrink-0`}>
              <div className="p-1">
                <Skeleton className={`${CATEGORY_TILE_IMAGE_CLASS} w-full rounded-xl`} />
              </div>
              <Skeleton className="mx-auto mt-2 h-5 w-24" />
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-3 pt-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 border-y border-gold-100 py-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="hidden h-9 w-24 rounded-lg lg:block" />
          <Skeleton className="hidden h-9 w-24 rounded-lg lg:block" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="ms-auto h-9 w-40 rounded-lg" />
        </div>

        <div className={`mt-8 ${PRODUCT_GRID_CLASS}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </SkeletonRegion>
    </div>
  );
}

/** Product page: breadcrumb, gallery (thumbnails + main photo), buy box. */
export function ProductPageSkeleton() {
  const { common } = useDictionary();

  return (
    <SkeletonRegion label={common.loadingProduct} className="page-container py-8">
      <Skeleton className="h-5 w-64" />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex gap-2 sm:order-1 sm:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-[72px] shrink-0 rounded-3xl" />
            ))}
          </div>
          <div className="order-first flex-1 rounded-3xl bg-white p-2.5 shadow-md sm:order-2">
            <Skeleton className="aspect-square w-full rounded-3xl" />
          </div>
        </div>

        <div>
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="mt-3 h-5 w-48" />
          <Skeleton className="mt-4 h-8 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-12 w-full rounded-full" />
        </div>
      </div>
    </SkeletonRegion>
  );
}
