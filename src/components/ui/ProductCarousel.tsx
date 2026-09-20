"use client";

import ProductCard from "@/components/ui/ProductCard";
import CarouselPagination from "@/components/ui/CarouselPagination";
import { useScrollCarousel } from "@/hooks/useScrollCarousel";
import { PRODUCT_CAROUSEL_GAP_CLASS, PRODUCT_CAROUSEL_ITEM_CLASS } from "@/config/layout";
import { useDictionary } from "@/store/locale";
import type { Product } from "@/types/product";

/** Horizontal scroll-snap row of ProductCards with dots + prev/next. */
export default function ProductCarousel({ products }: { products: Product[] }) {
  const { common } = useDictionary();
  const { scrollRef, pageCount, activePage, scrollByPage, handleScroll } =
    useScrollCarousel(products.length);

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex snap-x snap-mandatory ${PRODUCT_CAROUSEL_GAP_CLASS} overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`${PRODUCT_CAROUSEL_ITEM_CLASS} shrink-0 snap-start`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <CarouselPagination
          pageCount={pageCount}
          activePage={activePage}
          onPrev={() => scrollByPage(-1)}
          onNext={() => scrollByPage(1)}
          label={common.products}
          className="mt-4"
        />
      )}
    </>
  );
}
