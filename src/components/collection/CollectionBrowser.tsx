"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ChipButton } from "@/components/ui/Chip";
import { useDictionary, useLocale } from "@/store/locale";
import { formatNumber } from "@/utils/format";
import { formatMessage, pluralize } from "@/utils/i18n";
import ProductCard from "@/components/ui/ProductCard";
import CollectionToolbar from "@/components/collection/CollectionToolbar";
import type { FilterActions } from "@/components/collection/FilterOptions";
import { SparkleIcon, StarIcon, TrendingIcon } from "@/components/icons";
import { PRODUCT_GRID_CLASS } from "@/config/layout";
import { QUICK_TAG_CHIPS, SORT_OPTION_KEYS } from "@/config/catalog";
import {
  buildCatalogQueryString,
  type CatalogQueryState,
} from "@/utils/catalog-params";
import { buildFilterSections } from "@/utils/catalog-filters";
import type { CatalogFilter, CatalogPage } from "@/types/catalog";
import type { Product } from "@/types/product";

// Opened on demand — kept out of the grid's initial JS, then fetched once the
// page has settled so the first click isn't waiting on the network.
const loadFiltersDrawer = () => import("@/components/collection/FiltersDrawer");
const FiltersDrawer = dynamic(loadFiltersDrawer);
const PRELOAD_DRAWER_DELAY_MS = 2500;

/**
 * Filter/sort state lives in the URL (the server page re-renders with the
 * new Shopify results), so views are shareable and crawlable. Only "load
 * more" pagination is client state, and it resets whenever the server sends
 * a fresh first page.
 */
export default function CollectionBrowser({
  handle,
  initialPage,
  query,
  categoryFilter,
}: {
  handle: string;
  initialPage: CatalogPage;
  query: CatalogQueryState;
  /** Extra "Category" section (curation pages only), listed first. */
  categoryFilter: CatalogFilter | null;
}) {
  const router = useRouter();
  const locale = useLocale();
  const { collection: t } = useDictionary();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    const id = window.setTimeout(loadFiltersDrawer, PRELOAD_DRAWER_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Stable identity: useFocusTrap re-runs (and re-focuses) when onClose changes.
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const [products, setProducts] = useState<Product[]>(initialPage.products);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: initialPage.hasNextPage,
    endCursor: initialPage.endCursor,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Adjust state during render (not in an effect) when a new first page
  // arrives — avoids a frame of stale products. The drawer stays open across
  // filter changes because this component is not remounted.
  const [seenPage, setSeenPage] = useState(initialPage);
  if (seenPage !== initialPage) {
    setSeenPage(initialPage);
    setProducts(initialPage.products);
    setPageInfo({
      hasNextPage: initialPage.hasNextPage,
      endCursor: initialPage.endCursor,
    });
    setLoadError(null);
  }

  const { sort, filters: activeFilters } = query;
  const sortOptions = SORT_OPTION_KEYS.filter((key) =>
    initialPage.supportedSorts.includes(key),
  ).map((key) => ({ key, label: t.sort[key] }));
  const sections = buildFilterSections(
    [...(categoryFilter ? [categoryFilter] : []), ...initialPage.filters],
    t,
  );
  const currencyCode = products[0]?.price.currencyCode ?? "";

  function navigate(next: Partial<CatalogQueryState>) {
    const queryString = buildCatalogQueryString({ ...query, ...next });
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  const actions: FilterActions = {
    active: activeFilters,
    currencyCode,
    onToggle: (input) =>
      navigate({
        filters: activeFilters.includes(input)
          ? activeFilters.filter((filter) => filter !== input)
          : [...activeFilters, input],
      }),
  };

  const noneApplied = activeFilters.length === 0 && sort === "RECOMMENDED";

  // Quick tag chips act as one exclusive choice; Under-price stays combinable.
  const tagFilter = (tag: string) => JSON.stringify({ tag });
  const quickTagFilters = QUICK_TAG_CHIPS.map((chip) => tagFilter(chip.tag));
  const toggleTag = (tag: string) => {
    const filter = tagFilter(tag);
    const others = activeFilters.filter(
      (active) => !quickTagFilters.includes(active),
    );
    navigate({
      filters: activeFilters.includes(filter) ? others : [...others, filter],
    });
  };

  const total = initialPage.totalCount;
  const count = total ?? products.length;
  // A lone product reads "1 Product" only when it is truly the last page.
  const countLabel = pluralize(
    locale,
    count === 1 && !pageInfo.hasNextPage ? 1 : Math.max(count, 2),
    t.productsCount,
    `${formatNumber(count, locale)}${total === null && pageInfo.hasNextPage ? "+" : ""}`,
  );

  async function loadMore() {
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      // The catalog service (all its queries and filter logic) is only needed
      // once someone asks for a second page, so it stays out of the first load.
      const { getCatalogPage } = await import("@/services/shopify/catalog-service");
      const next = await getCatalogPage({
        handle,
        filters: activeFilters,
        sort,
        after: pageInfo.endCursor,
        withFilters: false,
        locale,
      });
      if (!next) throw new Error("Collection not found");
      setProducts((current) => {
        const seen = new Set(current.map((product) => product.id));
        return [
          ...current,
          ...next.products.filter((product) => !seen.has(product.id)),
        ];
      });
      setPageInfo({ hasNextPage: next.hasNextPage, endCursor: next.endCursor });
    } catch {
      setLoadError(t.loadMoreError);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <>
      {/* Pinned to the top while the product grid scrolls — the site header
          is static on collection pages, so this is the only sticky bar. The
          opaque background hides cards passing underneath. */}
      <div className="sticky top-0 z-30 mt-2 bg-cream-50 pt-3">
        {/* One swipeable row on phones (bleeding to the screen edges) instead
            of wrapping onto a second line; wraps normally from sm. */}
        <div className="-mx-(--page-gutter) flex scroll-px-(--page-gutter) snap-x items-center gap-2 overflow-x-auto px-(--page-gutter) pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          <ChipButton
            active={noneApplied}
            onClick={() => navigate({ sort: "RECOMMENDED", filters: [] })}
          >
            {t.all}
          </ChipButton>
          {QUICK_TAG_CHIPS.map((chip) => (
            <ChipButton
              key={chip.tag}
              active={activeFilters.includes(tagFilter(chip.tag))}
              onClick={() => toggleTag(chip.tag)}
            >
              {chip.tag === "New Arrival" && (
                <SparkleIcon className="h-3 w-3" />
              )}
              {chip.tag === "Bestseller" && <StarIcon className="h-3 w-3" />}
              {chip.tag === "Trending" && <TrendingIcon className="h-3 w-3" />}
              {t.chips[chip.key]}
            </ChipButton>
          ))}
        </div>

        <CollectionToolbar
          countLabel={countLabel}
          sections={sections}
          actions={actions}
          sort={sort}
          sortOptions={sortOptions}
          onSortChange={(next) => navigate({ sort: next })}
          onOpenFilters={() => setDrawerOpen(true)}
          onClearAll={() => navigate({ filters: [] })}
        />
      </div>

      <div
        aria-busy={isPending}
        className={`mt-8 transition-opacity duration-300 ${isPending ? "opacity-50" : ""}`}
      >
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold-100 bg-white px-4 py-16 text-center">
            <p className="font-sans text-base text-brown-900">
              {activeFilters.length > 0 ? t.noMatch : t.noProducts}
            </p>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => navigate({ filters: [] })}
                className="mt-4 h-10 rounded-full bg-gold-600 px-6 text-sm font-medium text-white transition-colors hover:bg-gold-700"
              >
                {t.clearAllFilters}
              </button>
            )}
          </div>
        ) : (
          <ul className={PRODUCT_GRID_CLASS}>
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {pageInfo.hasNextPage && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {loadError && (
            <p role="alert" className="font-sans text-sm text-error-700">
              {loadError}
            </p>
          )}
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="h-11 rounded-full border border-gold-600 bg-white px-8 font-sans text-sm font-medium text-gold-700 transition-colors hover:bg-cream-100 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore ? t.loadingMore : t.loadMore}
          </button>
          {total !== null && (
            <p className="font-sans text-xs text-brown-900/60">
              {formatMessage(t.showing, {
                shown: formatNumber(products.length, locale),
                total: formatNumber(total, locale),
              })}
            </p>
          )}
        </div>
      )}

      {drawerOpen && (
        <FiltersDrawer
          sections={sections}
          actions={actions}
          resultLabel={countLabel.toLowerCase()}
          onClearAll={() => navigate({ filters: [] })}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
