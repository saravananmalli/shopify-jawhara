import { notFound } from "next/navigation";
import CollectionBrowser from "@/components/collection/CollectionBrowser";
import CollectionCategoryStrip from "@/components/collection/CollectionCategoryStrip";
import {
  CATEGORY_MENU_HANDLE,
  GIFTS_PROMO_HANDLE,
  CATEGORY_SCOPED_MENU_COLUMNS,
  CATEGORY_TILE_GROUPS,
  MAIN_MENU_HANDLE,
} from "@/config/catalog";
import {
  getCatalogPage,
  getCategoryTilesForCollection,
  getCategoryTilesFromMenu,
  withCategoryCounts,
} from "@/services/shopify";
import {
  inCollectionInput,
  parseCatalogSearchParams,
} from "@/utils/catalog-params";
import type { CatalogFilter } from "@/types/catalog";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * The whole collection page (category strip, chips, sticky filter bar,
 * product grid). Shared by `/collections/[handle]` and the `/collections`
 * index, which is the "all products" view of the same page.
 */
export default async function CollectionPageView({
  handle,
  rawSearchParams,
}: {
  handle: string;
  rawSearchParams: RawSearchParams;
}) {
  const query = parseCatalogSearchParams(rawSearchParams);

  const [page, strip] = await Promise.all([
    getCatalogPage({ handle, sort: query.sort, filters: query.filters }),
    getCategoryTilesForCollection(handle, {
      mainMenuHandle: MAIN_MENU_HANDLE,
      fallbackMenuHandle: CATEGORY_MENU_HANDLE,
      scopedColumns: CATEGORY_SCOPED_MENU_COLUMNS,
      tileGroups: CATEGORY_TILE_GROUPS,
    }),
  ]);

  if (!page) notFound();

  // The gift promo page has no menu column, so its tiles are the product
  // categories — narrowed to the ones with gift products and made to filter
  // this page in place, so the row stays put when one is chosen.
  let stripTiles = strip.tiles;
  let stripScope: { basePath: string; query: typeof query } | undefined;
  if (handle === GIFTS_PROMO_HANDLE) {
    const counted = await withCategoryCounts(
      handle,
      await getCategoryTilesFromMenu(CATEGORY_MENU_HANDLE),
    );
    if (counted.length > 0) {
      stripTiles = counted;
      stripScope = { basePath: `/collections/${handle}`, query };
    }
  }

  // Inside a curation (e.g. "Trending Collections") the filters gain a
  // Category section: the product categories that have products in it.
  const categoryTiles =
    strip.categoryTiles.length > 0
      ? await withCategoryCounts(handle, strip.categoryTiles)
      : [];
  const categoryFilter: CatalogFilter | null =
    categoryTiles.length > 0
      ? {
          id: "category",
          label: "Category",
          type: "LIST",
          values: categoryTiles.map((tile) => ({
            id: `category.${tile.handle}`,
            label: tile.title,
            count: tile.count ?? 0,
            input: inCollectionInput(tile.handle),
          })),
        }
      : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.collection.title,
    ...(page.collection.description && {
      description: page.collection.description,
    }),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/products/${product.handle}`,
      })),
    },
  };

  return (
    <div className="bg-cream-50">
      <section className="mx-auto max-w-8xl pb-16 pt-3">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <h1 className="sr-only">{page.collection.title}</h1>

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
        />
      </section>
    </div>
  );
}
