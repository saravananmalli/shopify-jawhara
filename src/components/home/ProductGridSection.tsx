"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import CarouselPagination from "@/components/ui/CarouselPagination";
import { ChevronRightIcon } from "@/components/icons";
import { useScrollCarousel } from "@/hooks/useScrollCarousel";
import { getProducts, searchProducts } from "@/services/shopify";
import type { Product } from "@/types/product";

/**
 * "initial" reuses the products already fetched server-side for this
 * section (no refetch); "query" runs a real Shopify search-query filter
 * (price range, tag, ...); "sort" re-fetches with a different sort key.
 * Every tab is backed by a real Shopify query — a tab with no matching
 * products (e.g. a tag nothing is tagged with yet) shows a real empty
 * state, never fake results.
 */
export type ProductTab =
  | { label: string; mode: "initial" }
  | { label: string; mode: "query"; query: string }
  | {
      label: string;
      mode: "sort";
      sortKey: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
    };

export default function ProductGridSection({
  eyebrow = "Haute Vitrine",
  title,
  subtitle,
  tabs,
  products: initialProducts,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  tabs: ProductTab[];
  products: Product[];
}) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [fetchedProducts, setFetchedProducts] = useState<Product[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTab = tabs[activeTabIndex];
  const products =
    !activeTab || activeTab.mode === "initial"
      ? initialProducts
      : (fetchedProducts ?? []);

  const { scrollRef, pageCount, activePage, scrollByPage, handleScroll } =
    useScrollCarousel(products.length);

  useEffect(() => {
    const tab = tabs[activeTabIndex];
    // The "initial" tab reuses the `products` prop directly (see the
    // `products` derivation above) — nothing to fetch or sync into state.
    if (!tab || tab.mode === "initial") return;

    let cancelled = false;

    // Deferred to a microtask so setState doesn't run synchronously within
    // the effect body (matches the getCart().then() pattern in store/cart.tsx
    // and the wishlist store's hydration effect).
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);

      try {
        const result =
          tab.mode === "query"
            ? await searchProducts({ query: tab.query, first: 12 })
            : await getProducts({ sortKey: tab.sortKey, first: 12 });
        if (!cancelled) setFetchedProducts(result);
      } catch {
        if (!cancelled)
          setError("Couldn't load these products. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex]);

  return (
    <section className="border-y border-[#E3D5BC]/60">
      <div className="mx-auto max-w-8xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-sans text-3xl font-normal">{title}</h2>
            <p className="mt-1 font-sans text-sm text-brown-900/60">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTabIndex(i)}
                  aria-pressed={i === activeTabIndex}
                  className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                    i === activeTabIndex
                      ? "bg-gold-600 text-white"
                      : "border border-gold-200 text-brown-900/70 hover:bg-cream-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              href="/collections/all"
              className="flex items-center gap-1 font-sans text-sm font-medium text-gold-700 hover:underline"
            >
              View All <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-4 font-sans text-sm text-error-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-cream-100"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gold-200 bg-cream-100 px-4 py-10 text-center font-sans text-sm text-brown-900/60">
            No products match &ldquo;{tabs[activeTabIndex]?.label}&rdquo; yet.
          </p>
        ) : (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[calc(50%-8px)] shrink-0 snap-start lg:w-[calc(25%-12px)]"
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
                label="products"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
