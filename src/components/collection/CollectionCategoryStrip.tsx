"use client";

import Image from "next/image";
import Link from "next/link";
import CarouselPagination from "@/components/ui/CarouselPagination";
import { useScrollCarousel } from "@/hooks/useScrollCarousel";
import {
  buildCatalogQueryString,
  inCollectionInput,
  isInCollectionFilter,
  type CatalogQueryState,
} from "@/utils/catalog-params";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { CategoryTile } from "@/types/content";

// 2x the fixed tile width (226px).
const TILE_IMAGE_WIDTH = 452;

/** This page's URL with the category filter toggled and every other filter kept. */
function scopedHref(
  basePath: string,
  query: CatalogQueryState,
  categoryFilter: string,
  isSelected: boolean,
) {
  const others = query.filters.filter(
    (filter) => !isInCollectionFilter(filter),
  );
  const queryString = buildCatalogQueryString({
    ...query,
    filters: isSelected ? others : [...others, categoryFilter],
  });
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export default function CollectionCategoryStrip({
  categories,
  currentHandle,
  scope,
}: {
  categories: CategoryTile[];
  currentHandle: string;
  /** Tiles are product categories that filter the current collection in
   * place (`?filter=…`) instead of linking to another collection page. */
  scope?: { basePath: string; query: CatalogQueryState };
}) {
  const { scrollRef, pageCount, activePage, scrollByPage, handleScroll } =
    useScrollCarousel(categories.length);

  if (categories.length === 0) return null;

  return (
    <nav aria-label="Shop by category">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-4">
          {categories.map((category) => {
            const categoryFilter = inCollectionInput(category.handle);
            const isCurrent = scope
              ? scope.query.filters.includes(categoryFilter)
              : category.handle === currentHandle;
            const href = scope
              ? scopedHref(
                  scope.basePath,
                  scope.query,
                  categoryFilter,
                  isCurrent,
                )
              : `/collections/${category.handle}`;
            return (
              <li key={category.id} className="w-[226px] shrink-0 snap-start">
                <Link
                  href={href}
                  scroll={!scope}
                  aria-current={
                    isCurrent ? (scope ? "true" : "page") : undefined
                  }
                  className="group block"
                >
                  {/* The selected border sits inside this wrapper (transparent
                      when not selected, so tiles never shift) — an outside
                      ring would be clipped by the scrolling row. */}
                  <div
                    className={`rounded-2xl border-2 p-1 transition-colors ${
                      isCurrent ? "border-gold-600" : "border-transparent"
                    }`}
                  >
                    <div className="relative h-[240px] w-full overflow-hidden rounded-xl bg-cream-100">
                      {category.imageUrl && (
                        <Image
                          src={getShopifyImageUrl(
                            category.imageUrl,
                            TILE_IMAGE_WIDTH,
                          )}
                          alt={category.imageAlt}
                          fill
                          sizes="226px"
                          placeholder="blur"
                          blurDataURL={IMAGE_BLUR_DATA_URL}
                          className="object-cover transition-transform duration-300 ease-luxury group-hover:scale-105"
                        />
                      )}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-center font-sans text-[15px] ${isCurrent ? "text-gold-600" : "text-brown-900"}`}
                  >
                    {category.title}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {pageCount > 1 && (
        <CarouselPagination
          pageCount={pageCount}
          activePage={activePage}
          onPrev={() => scrollByPage(-1)}
          onNext={() => scrollByPage(1)}
          label="categories"
          className="mt-2"
        />
      )}
    </nav>
  );
}
