"use client";

import { useEffect, useState } from "react";
import Link from "@/components/ui/Link";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductShelf from "@/components/ui/ProductShelf";
import { ProductCarouselSkeleton } from "@/components/ui/Skeleton";
import { ChevronRightIcon } from "@/components/icons";
import { filterProducts, getCollectionProducts, getProducts } from "@/services/shopify";
import type { Product } from "@/types/product";

/**
 * "initial" reuses the products already fetched server-side for this
 * section (no refetch); "query" runs a real Shopify search-query filter
 * (price range, tag, ...); "collection" lists an existing Shopify
 * collection's products in their Admin order; "sort" re-fetches with a
 * different sort key.
 * Every tab is backed by a real Shopify query — a tab with no matching
 * products (e.g. a tag nothing is tagged with yet) shows a real empty
 * state, never fake results.
 */
export type ProductTab =
  | { label: string; mode: "initial" }
  | { label: string; mode: "query"; query: string }
  | { label: string; mode: "collection"; handle: string }
  | {
      label: string;
      mode: "sort";
      sortKey: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";
    };

export default function ProductGridSection({
  eyebrow,
  title,
  subtitle,
  tabs,
  products: initialProducts,
  tightOnPhone,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tabs: ProductTab[];
  products: Product[];
  tightOnPhone?: boolean;
}) {
  const locale = useLocale();
  const t = useDictionary();
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
            ? await filterProducts({ query: tab.query, first: 12, locale })
            : tab.mode === "collection"
              ? await getCollectionProducts({ handle: tab.handle, first: 12, locale })
              : await getProducts({ sortKey: tab.sortKey, first: 12, locale });
        if (!cancelled) setFetchedProducts(result);
      } catch {
        if (!cancelled)
          setError(t.home.loadError);
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
      tightOnPhone={tightOnPhone}
      actions={
        <div className="flex min-w-0 max-w-full flex-col items-start gap-3 sm:items-end">
          {/* One swipeable row on phones (bleeding to the screen edges) so a long
              tab list never wraps onto extra lines; wraps normally from sm. */}
          <div className="-mx-(--page-gutter) flex max-w-[100vw] scroll-px-(--page-gutter) snap-x items-center gap-2 overflow-x-auto px-(--page-gutter) pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:flex-wrap sm:scroll-px-0 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTabIndex(i)}
                aria-pressed={i === activeTabIndex}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full px-3.5 py-2 font-sans text-xs font-medium transition-colors sm:py-1.5 ${
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
            {t.common.viewAll} <ChevronRightIcon className="h-4 w-4" />
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
        <ProductCarouselSkeleton />
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gold-200 bg-cream-100 px-4 py-10 text-center font-sans text-sm text-brown-900/60">
          {formatMessage(t.home.noMatchYet, { label: tabs[activeTabIndex]?.label ?? "" })}
        </p>
      ) : (
        <ProductCarousel products={products} />
      )}
    </ProductShelf>
  );
}
