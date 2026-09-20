import { notFound } from "next/navigation";
import CollectionBrowser from "@/components/collection/CollectionBrowser";
import CollectionCategoryStrip from "@/components/collection/CollectionCategoryStrip";
import {
  ALL_PRODUCTS_HANDLE,
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
}: {
  handle: string;
  rawSearchParams: RawSearchParams;
}) {
  const locale = await getLocale();
  const { collection: t, meta } = await getDictionary(locale);
  const query = parseCatalogSearchParams(rawSearchParams);

  const [page, strip] = await Promise.all([
    getCatalogPage({ handle, sort: query.sort, filters: query.filters, locale }),
    getCategoryTilesForCollection(handle, {
      mainMenuHandle: MAIN_MENU_HANDLE,
      fallbackMenuHandle: CATEGORY_MENU_HANDLE,
      scopedColumns: CATEGORY_SCOPED_MENU_COLUMNS,
      tileGroups: CATEGORY_TILE_GROUPS,
      locale,
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
      await getCategoryTilesFromMenu(CATEGORY_MENU_HANDLE, locale),
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
    <div className="bg-cream-50">
      <section className="mx-auto max-w-8xl pb-16 pt-3">
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
        />
      </section>
    </div>
  );
}
