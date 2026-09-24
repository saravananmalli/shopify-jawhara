import { notFound } from "next/navigation";
import CollectionBrowser from "@/components/collection/CollectionBrowser";
import CollectionCategoryStrip from "@/components/collection/CollectionCategoryStrip";
import {
  ALL_PRODUCTS_HANDLE,
  CATEGORY_MENU_HANDLE,
  GIFTS_PROMO_HANDLE,
  CATEGORY_SCOPED_MENU_COLUMNS,
  CATEGORY_TILE_GROUPS,
  JEWELLERY_CATEGORY_HANDLES,
  KIDS_CATEGORY_HANDLES,
  KIDS_LANDING_HANDLE,
  MAIN_MENU_HANDLE,
} from "@/config/catalog";
import {
  getCatalogPage,
  getCategoryTilesByHandles,
  getCategoryTilesForCollection,
  getCategoryTilesFromMenu,
  getMenu,
  getMenuCollectionTiles,
  withCategoryCounts,
} from "@/services/shopify";
import {
  inCollectionInput,
  parseCatalogSearchParams,
} from "@/utils/catalog-params";
import type { CatalogFilter } from "@/types/catalog";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { localizePath } from "@/utils/locale-path";
import { serializeJsonLd } from "@/utils/json-ld";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * The whole collection page (category strip, chips, sticky filter bar,
 * product grid). Shared by `/collections/[handle]` and the `/collections`
 * index, which is the "all products" view of the same page.
 */
export default async function CollectionPageView({
  handle,
  rawSearchParams,
  ourCollectionsLanding = false,
}: {
  handle: string;
  rawSearchParams: RawSearchParams;
  /** The "Our Collections" menu link lands on the all-products page; on it the
   * category strip is the collections listed under that menu item (365, Ada…)
   * instead of the product categories. */
  ourCollectionsLanding?: boolean;
}) {
  const locale = await getLocale();
  const { collection: t, meta } = await getDictionary(locale);
  const query = parseCatalogSearchParams(rawSearchParams);

  const [page, strip] = await Promise.all([
    getCatalogPage({ handle, sort: query.sort, filters: query.filters, locale }),
    getCategoryTilesForCollection(handle, {
      mainMenuHandle: MAIN_MENU_HANDLE,
      fallbackMenuHandle: CATEGORY_MENU_HANDLE,
      fallbackHandles: JEWELLERY_CATEGORY_HANDLES,
      scopedColumns: CATEGORY_SCOPED_MENU_COLUMNS,
      tileGroups: CATEGORY_TILE_GROUPS,
      locale,
    }),
  ]);

  if (!page) notFound();

  // The gift promo page has no menu column, so its tiles are the product
  // categories — narrowed to the ones with gift products and made to filter
  // this page in place, so the row stays put when one is chosen. Those same
  // counted tiles double as the Category section below, so a pick from
  // either place shows checked/selected in the other.
  let stripTiles = strip.tiles;
  let stripScope: { basePath: string; query: typeof query } | undefined;
  let inPlaceCategoryTiles: typeof strip.categoryTiles = [];
  if (handle === GIFTS_PROMO_HANDLE) {
    const counted = await withCategoryCounts(
      handle,
      await getCategoryTilesFromMenu(CATEGORY_MENU_HANDLE, locale),
    );
    if (counted.length > 0) {
      stripTiles = counted;
      stripScope = { basePath: `/collections/${handle}`, query };
      inPlaceCategoryTiles = counted;
    }
  }

  // The Kids main-menu link is a single top-level link (no mega-menu column,
  // unlike Gold/Diamonds/Pearls' image megamenus but same handle-list
  // mechanism), so its landing page isn't itself a member of
  // KIDS_CATEGORY_HANDLES — give it that group's tabs explicitly, as real
  // links to those sibling pages (Pearl's tab/category structure), not an
  // in-place filter like the gift promo page above.
  if (handle === KIDS_LANDING_HANDLE) {
    const kidsTiles = await getCategoryTilesByHandles(KIDS_CATEGORY_HANDLES, locale);
    if (kidsTiles.length > 0) stripTiles = kidsTiles;
  }

  if (ourCollectionsLanding) {
    const [menu, tilesByItem] = await Promise.all([
      getMenu(MAIN_MENU_HANDLE, locale),
      getMenuCollectionTiles(MAIN_MENU_HANDLE, locale),
    ]);
    // Matched by the default-language key so it works in Arabic too.
    const ours = tilesByItem[menu.findIndex((link) => link.key === "our collections")] ?? [];
    if (ours.length > 0) stripTiles = ours;
  }

  // The gift promo page and the "all" page get a real togglable Category
  // filter: unlike a normal category page's strip (sibling pages to link
  // to), every tile there is already a genuine subset of the current
  // collection, so it can double as a filter instead of only being a set of
  // links.
  const categoryTiles =
    inPlaceCategoryTiles.length > 0
      ? inPlaceCategoryTiles
      : handle === ALL_PRODUCTS_HANDLE
        ? await withCategoryCounts(handle, stripTiles)
        : [];
  const categoryFilter: CatalogFilter | null =
    categoryTiles.length > 0
      ? {
          id: "category",
          label: t.categoryFilter,
          type: "LIST",
          values: categoryTiles.map((tile) => ({
            id: `category.${tile.handle}`,
            label: tile.title,
            count: tile.count ?? 0,
            input: inCollectionInput(tile.handle),
          })),
        }
      : null;

  // Every other page's strip — a plain category page's siblings (Rings sees
  // Earrings, Necklace…), a Gold/Diamond/Pearl tile group, or a curation
  // column (occasion, recipient, gift collections, curations & style, e.g.
  // Birthday, Wedding, "Trending Collections") — links to sibling collection
  // pages instead of filtering this one: the Category section mirrors those
  // exact tiles as links rather than a togglable filter, since picking a
  // sibling there can't narrow *this* collection's results — it takes you to
  // that one, same as clicking its strip tile does. Always derived from
  // what's actually on this page, never a fixed list; skipped when there's
  // nothing to pick besides the page you're already on.
  const categoryLinks: typeof strip.categoryTiles =
    categoryFilter === null && stripTiles.length > 1 ? stripTiles : [];

  // Shopify has no "all" collection, so its title is ours to translate.
  const collectionTitle =
    handle === ALL_PRODUCTS_HANDLE ? meta.allJewellery : page.collection.title;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    inLanguage: locale,
    name: collectionTitle,
    ...(page.collection.description && {
      description: page.collection.description,
    }),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: localizePath(`/products/${product.handle}`, locale),
      })),
    },
  };

  return (
    <div className="bg-background">
      <section className="page-container pb-16 pt-3">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />

        <h1 className="sr-only">{collectionTitle}</h1>

        <CollectionCategoryStrip
          categories={stripTiles}
          currentHandle={handle}
          scope={stripScope}
        />

        <CollectionBrowser
          handle={handle}
          initialPage={page}
          query={query}
          categoryFilter={categoryFilter}
          categoryLinks={categoryLinks}
        />
      </section>
    </div>
  );
}
