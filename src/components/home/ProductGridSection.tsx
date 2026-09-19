"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductShelf from "@/components/ui/ProductShelf";
import { ChevronRightIcon } from "@/components/icons";
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
    <ProductShelf
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      actions={
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
      }
    >
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
        <ProductCarousel products={products} />
      )}
    </ProductShelf>
  );
}
