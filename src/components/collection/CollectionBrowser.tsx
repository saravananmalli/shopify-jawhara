"use client";

import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useDictionary, useLocale } from "@/store/locale";
import { formatNumber } from "@/utils/format";
import { formatMessage, pluralize } from "@/utils/i18n";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import EmptyStateBox from "@/components/ui/EmptyStateBox";
import CollectionToolbar from "@/components/collection/CollectionToolbar";
import type { FilterActions } from "@/components/collection/FilterOptions";
import { PRODUCT_GRID_CLASS } from "@/config/layout";
import { QUICK_TAG_CHIPS, SORT_OPTION_KEYS } from "@/config/catalog";
import {
  buildCatalogQueryString,
  unionCollectionInput,
  type CatalogQueryState,
} from "@/utils/catalog-params";
import { buildFilterSections, type FilterSection } from "@/utils/catalog-filters";
import type { CatalogFilter, CatalogPage } from "@/types/catalog";
import type { CategoryTile } from "@/types/content";
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
  categoryLinks,
}: {
  handle: string;
  initialPage: CatalogPage;
  query: CatalogQueryState;
  /** Extra "Category" section (curation pages whose strip filters this page
   * in place, e.g. Gift, "all"), listed first. Mutually exclusive with
   * `categoryLinks` — a page has one or the other, never both. */
  categoryFilter: CatalogFilter | null;
  /** Category section for pages whose strip links to sibling collections
   * instead (Rings, Birthday, Wedding…). The strip itself stays single-select
   * navigation; here each sibling is a real checkbox that pulls that whole
   * collection's products into this page's grid, combined with the current
   * one — the current page's own tile is always included and locked. */
  categoryLinks: CategoryTile[];
}) {
  const router = useRouter();
  const locale = useLocale();
  const { collection: t } = useDictionary();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Checkboxes/sort must react the instant they're clicked, not once the
  // server round-trip lands — that's the whole point of `useOptimistic` over
  // just reading `query` straight from props. It falls back to `query` on
  // its own once the real navigation resolves, so no separate reset is needed.
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
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

  const { sort, filters: activeFilters } = optimisticQuery;
  const sortOptions = SORT_OPTION_KEYS.filter((key) =>
    initialPage.supportedSorts.includes(key),
  ).map((key) => ({ key, label: t.sort[key] }));
  const categoryLinkSection: FilterSection | null =
    categoryLinks.length > 0
      ? {
          key: "category",
          label: t.categoryFilter,
          kind: "category",
          categoryLinks: categoryLinks.map((tile) => ({
            id: tile.id,
            label: tile.title,
            input: unionCollectionInput(tile.handle),
            current: tile.handle === handle,
          })),
        }
      : null;
  const sections = [
    ...(categoryLinkSection ? [categoryLinkSection] : []),
    ...buildFilterSections(
      [...(categoryFilter ? [categoryFilter] : []), ...initialPage.filters],
      t,
    ),
  ];
  const currencyCode = products[0]?.price.currencyCode ?? "";

  function navigate(next: Partial<CatalogQueryState>) {
    // Based on the optimistic state, not the raw `query` prop, so a second
    // toggle fired before the first one's navigation has landed still builds
    // on the first (rather than reverting it).
    const merged = { ...optimisticQuery, ...next };
    const queryString = buildCatalogQueryString(merged);
    startTransition(() => {
      setOptimisticQuery(merged);
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

  // Quick tag dropdown acts as one exclusive choice; Under-price stays combinable.
  const tagFilter = (tag: string) => JSON.stringify({ tag });
  const quickTagFilters = QUICK_TAG_CHIPS.map((chip) => tagFilter(chip.tag));
  const selectedQuickTag =
    QUICK_TAG_CHIPS.find((chip) => activeFilters.includes(tagFilter(chip.tag)))
      ?.tag ?? null;
  const selectQuickTag = (tag: string | null) => {
    const others = activeFilters.filter(
      (active) => !quickTagFilters.includes(active),
    );
    navigate({ filters: tag ? [...others, tagFilter(tag)] : others });
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
      <div className="sticky top-(--sticky-top) z-30 mt-2 bg-background pt-3 transition-[top] duration-300 ease-luxury">
        <CollectionToolbar
          countLabel={countLabel}
          sections={sections}
          actions={actions}
          quickTagSelected={selectedQuickTag}
          onQuickTagSelect={selectQuickTag}
          sort={sort}
          sortOptions={sortOptions}
          onSortChange={(next) => navigate({ sort: next })}
          onOpenFilters={() => setDrawerOpen(true)}
          onClearAll={() => navigate({ filters: [] })}
        />
      </div>

      <div
        aria-busy={isPending}
        className={`mt-6 transition-opacity duration-300 ${isPending ? "opacity-50" : ""}`}
      >
        {products.length === 0 ? (
          <EmptyStateBox className="py-16">
            <p className="font-sans text-base text-brown-900">
              {activeFilters.length > 0 ? t.noMatch : t.noProducts}
            </p>
            {activeFilters.length > 0 && (
              <Button
                variant="primary"
                onClick={() => navigate({ filters: [] })}
                className="mt-4 h-10 px-6 text-sm font-medium"
              >
                {t.clearAllFilters}
              </Button>
            )}
          </EmptyStateBox>
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
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="h-11 px-8 font-sans text-sm font-medium disabled:cursor-wait!"
          >
            {isLoadingMore ? t.loadingMore : t.loadMore}
          </Button>
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
          quickTag={{ selected: selectedQuickTag, onSelect: selectQuickTag }}
          resultLabel={countLabel.toLowerCase()}
          onClearAll={() => navigate({ filters: [] })}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
