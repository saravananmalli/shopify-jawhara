import { shopifyFetch } from "@/services/shopify/client";
import { defaultLocale, type Locale } from "@/config/i18n";
import {
  sortByDisplayOrder,
  sortOccasionsByDisplayOrder,
  sortStoreNodes,
  sortTestimonialsByDisplayOrder,
  toBrand,
  toCategoryTile,
  findMenuColumnItems,
  toCategoryTilesFromMenu,
  toCollection,
  toHeroBanner,
  toContentPage,
  toNavLinks,
  withDefaultLanguageKeys,
  toOccasion,
  toSitemapEntry,
  toStoreLocation,
  toTestimonial,
} from "@/services/shopify/adapters";
import {
  BRAND_QUERY,
  CATEGORY_MENU_QUERY,
  MAIN_MENU_COLLECTIONS_QUERY,
  buildCollectionsByHandlesQuery,
  COLLECTIONS_QUERY,
  HERO_BANNERS_QUERY,
  MENU_QUERY,
  OCCASIONS_QUERY,
  PAGE_QUERY,
  SHOP_POLICIES_QUERY,
  SITEMAP_QUERY,
  STORE_LOCATIONS_QUERY,
  TESTIMONIALS_QUERY,
} from "@/graphql/queries";
import type {
  Brand,
  CategoryTile,
  Collection,
  ContentPage,
  HeroBanner,
  NavLink,
  Occasion,
  SitemapEntry,
  StoreLocation,
  Testimonial,
} from "@/types/content";
import type {
  ShopifyBrand,
  ShopifyCategoryMenuItem,
  ShopifyMainMenuCollections,
  ShopifyCollection,
  ShopifyCollectionHeader,
  ShopifyHeroBannerMetaobject,
  ShopifyMenuItem,
  ShopifyOccasionMetaobject,
  ShopifyPage,
  ShopifyShopPolicies,
  ShopifySitemapNode,
  ShopifyStoreLocationMetaobject,
  ShopifyTestimonialMetaobject,
} from "@/types/shopify-api";
import { resolveMapLinkCoordinates } from "@/services/map-link-service";
import { parseCoordinates } from "@/utils/geo";

const CONTENT_REVALIDATE_SECONDS = 3600; // stable content — rule #22

export async function getBrand(locale: Locale): Promise<Brand> {
  const data = await shopifyFetch<{
    shop: { brand: ShopifyBrand | null };
  }>({
    query: BRAND_QUERY,
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return toBrand(data.shop.brand);
}

/**
 * Returns [] (not an error) when the menu handle doesn't exist yet — lets
 * callers fall back to a default nav instead of breaking the header.
 */
export async function getMenu(handle: string, locale: Locale): Promise<NavLink[]> {
  const fetchMenu = (menuLocale: Locale) =>
    shopifyFetch<{ menu: { items: ShopifyMenuItem[] } | null }>({
      query: MENU_QUERY,
      variables: { handle },
      locale: menuLocale,
      revalidate: CONTENT_REVALIDATE_SECONDS,
    });

  // The default-language menu is fetched too so entries can be recognised by
  // their English title after translation. It is the same cached request the
  // English site makes, so it costs nothing extra there.
  const [data, base] = await Promise.all([
    fetchMenu(locale),
    locale === defaultLocale ? null : fetchMenu(defaultLocale),
  ]);
  if (!data.menu) return [];

  const links = toNavLinks(data.menu.items);
  return base?.menu ? withDefaultLanguageKeys(links, toNavLinks(base.menu.items)) : links;
}

export async function getCategoryCollections({
  first = 8,
  locale,
}: { first?: number; locale: Locale }): Promise<CategoryTile[]> {
  const data = await shopifyFetch<{
    collections: { edges: { node: ShopifyCollection }[] };
  }>({
    query: COLLECTIONS_QUERY,
    variables: { first },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return data.collections.edges.map((edge) => toCategoryTile(edge.node));
}

/**
 * Category tiles defined by a Shopify menu's collection links. Returns []
 * (not an error) while the menu doesn't exist yet, so callers hide the
 * section instead of breaking the page.
 */
export async function getCategoryTilesFromMenu(
  handle: string,
  locale: Locale,
): Promise<CategoryTile[]> {
  const data = await shopifyFetch<{
    menu: { items: ShopifyCategoryMenuItem[] } | null;
  }>({
    query: CATEGORY_MENU_QUERY,
    variables: { handle },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return data.menu ? toCategoryTilesFromMenu(data.menu.items) : [];
}

/**
 * Category tiles for the given collection handles, in that order. One cached
 * request (collections are stable content); handles that don't exist or have
 * no image are skipped.
 */
export async function getCategoryTilesByHandles(
  handles: string[],
  locale: Locale,
): Promise<CategoryTile[]> {
  const collections = await getCategoryCollections({ first: 100, locale });
  return handles.flatMap((handle) => {
    const tile = collections.find((collection) => collection.handle === handle);
    return tile?.imageUrl ? [tile] : [];
  });
}

/**
 * Tiles for a collection page's category strip: the links in the same
 * main-menu column as `handle` (with their collection images), else the
 * fallback menu. Falls back too when that column has no tile with an image
 * yet, so the page never shows an empty strip.
 *
 * For a *curation* column (see CATEGORY_SCOPED_MENU_COLUMNS) it also returns
 * `categoryTiles`: the product categories, for a second row that narrows the
 * curation's own products. Empty for every other column.
 */
export async function getCategoryTilesForCollection(
  handle: string,
  {
    mainMenuHandle,
    fallbackMenuHandle,
    scopedColumns,
    tileGroups,
    locale,
  }: {
    mainMenuHandle: string;
    fallbackMenuHandle: string;
    scopedColumns: string[];
    tileGroups: string[][];
    locale: Locale;
  },
): Promise<{ tiles: CategoryTile[]; categoryTiles: CategoryTile[] }> {
  const fetchMainMenu = (menuLocale: Locale) =>
    shopifyFetch<{ menu: ShopifyMainMenuCollections | null }>({
      query: MAIN_MENU_COLLECTIONS_QUERY,
      variables: { handle: mainMenuHandle },
      locale: menuLocale,
      revalidate: CONTENT_REVALIDATE_SECONDS,
    });

  // Column titles are matched by their default-language name (see
  // CATEGORY_SCOPED_MENU_COLUMNS), so that check runs on the default-language
  // menu; the tiles themselves come from the translated one.
  const [data, base] = await Promise.all([
    fetchMainMenu(locale),
    locale === defaultLocale ? null : fetchMainMenu(defaultLocale),
  ]);

  const column = data.menu ? findMenuColumnItems(data.menu, handle) : null;
  const siblings = column ? toCategoryTilesFromMenu(column.items) : [];
  const baseColumn = base ? (base.menu ? findMenuColumnItems(base.menu, handle) : null) : column;
  const isCuration =
    !!baseColumn && scopedColumns.includes(baseColumn.title.trim().toLowerCase());

  // Order of precedence: the menu column, then a tile group (e.g. Gold), then
  // the fallback menu — so a page already found in a column never changes.
  const tileGroup =
    siblings.length > 0
      ? undefined
      : tileGroups.find((group) => group.includes(handle));
  const groupTiles = tileGroup
    ? await getCategoryTilesByHandles(tileGroup, locale)
    : [];

  const [tiles, categoryTiles] = await Promise.all([
    siblings.length > 0
      ? siblings
      : groupTiles.length > 0
        ? groupTiles
        : getCategoryTilesFromMenu(fallbackMenuHandle, locale),
    isCuration ? getCategoryTilesFromMenu(fallbackMenuHandle, locale) : [],
  ]);
  return { tiles, categoryTiles };
}

/**
 * Collections (title, description, image — no products) for several handles
 * in ONE request. Handles that don't exist (deleted/renamed/not yet created)
 * are dropped rather than throwing; order follows `handles`.
 */
export async function getCollectionsByHandles(
  handles: readonly string[],
  locale: Locale,
): Promise<Collection[]> {
  const unique = [...new Set(handles)];
  if (unique.length === 0) return [];

  const data = await shopifyFetch<
    Record<string, ShopifyCollectionHeader | null>
  >({
    query: buildCollectionsByHandlesQuery(unique.length),
    variables: Object.fromEntries(unique.map((handle, i) => [`h${i}`, handle])),
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return unique.flatMap((_, i) => {
    const collection = data[`c${i}`];
    return collection ? [toCollection(collection)] : [];
  });
}

/**
 * Returns null when no collection has that handle (deleted, unpublished, or
 * a stale link in the Shopify nav menu) — callers should render a real
 * not-found state, not fall back to fake data.
 */
export async function getCollectionByHandle(
  handle: string,
  locale: Locale,
): Promise<Collection | null> {
  const [collection] = await getCollectionsByHandles([handle], locale);
  return collection ?? null;
}

/**
 * Several named groups of collections (e.g. the header's Gold / Diamond /
 * Pearl menus) resolved with a single Shopify request instead of one per
 * group or per handle.
 */
export async function getCollectionGroups<K extends string>(
  groups: Record<K, readonly string[]>,
  locale: Locale,
): Promise<Record<K, Collection[]>> {
  const found = await getCollectionsByHandles(
    Object.values<readonly string[]>(groups).flat(),
    locale,
  );
  const byHandle = new Map(found.map((collection) => [collection.handle, collection]));

  return Object.fromEntries(
    (Object.entries(groups) as [K, readonly string[]][]).map(([key, handles]) => [
      key,
      handles.flatMap((handle) => byHandle.get(handle) ?? []),
    ]),
  ) as Record<K, Collection[]>;
}

/**
 * Returns [] when the `hero_banner` metaobject definition hasn't been
 * created in Shopify Admin yet, rather than throwing.
 */
export async function getHeroBanners({
  first = 5,
  locale,
}: { first?: number; locale: Locale }): Promise<HeroBanner[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyHeroBannerMetaobject }[] };
  }>({
    query: HERO_BANNERS_QUERY,
    variables: { first },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges.map((edge) => edge.node);
  return sortByDisplayOrder(nodes).map(toHeroBanner);
}

/**
 * Returns [] when the `occasion` metaobject definition hasn't been created
 * yet, or nothing is marked Active — the homepage section renders nothing
 * in that case rather than showing fake occasions.
 */
export async function getOccasions({
  first = 10,
  locale,
}: { first?: number; locale: Locale }): Promise<Occasion[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyOccasionMetaobject }[] };
  }>({
    query: OCCASIONS_QUERY,
    variables: { first },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges
    .map((edge) => edge.node)
    .filter((node) => node.active?.value === "true");
  return sortOccasionsByDisplayOrder(nodes).map(toOccasion);
}

/**
 * Returns [] when the `testimonial` metaobject definition hasn't been created
 * yet, or nothing is marked Active — the homepage section renders nothing in
 * that case rather than showing fake reviews.
 */
export async function getTestimonials({
  first = 6,
  locale,
}: { first?: number; locale: Locale }): Promise<Testimonial[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyTestimonialMetaobject }[] };
  }>({
    query: TESTIMONIALS_QUERY,
    variables: { first },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges
    .map((edge) => edge.node)
    .filter((node) => node.active?.value === "true" && node.quote?.value);
  return sortTestimonialsByDisplayOrder(nodes).map(toTestimonial);
}

/**
 * Returns [] when the `store_location` metaobject definition hasn't been
 * created yet, or every entry is hidden — the page shows a real empty state.
 * An entry is hidden only by an explicit `active = false`, so stores added
 * without the field still show.
 *
 * Position: the `latitude`/`longitude` fields win; otherwise it is read from
 * the Google Maps link (short links are resolved on the server), so pasting
 * a map link into Admin is enough.
 */
export async function getStoreLocations(locale: Locale): Promise<StoreLocation[]> {
  const data = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyStoreLocationMetaobject }[] };
  }>({
    query: STORE_LOCATIONS_QUERY,
    variables: { first: 250 },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  const nodes = data.metaobjects.edges
    .map((edge) => edge.node)
    .filter((node) => node.active?.value !== "false" && node.name?.value?.trim());

  return Promise.all(
    sortStoreNodes(nodes).map(async (node) =>
      toStoreLocation(
        node,
        parseCoordinates(node.latitude?.value, node.longitude?.value) ??
          (await resolveMapLinkCoordinates(node.mapLink?.value)),
      ),
    ),
  );
}

/** Storefront API caps a page at 250; a catalogue past that needs pagination. */
export async function getSitemapEntries(locale: Locale): Promise<{
  products: SitemapEntry[];
  collections: SitemapEntry[];
}> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifySitemapNode }[] };
    collections: { edges: { node: ShopifySitemapNode }[] };
  }>({
    query: SITEMAP_QUERY,
    variables: { first: 250 },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return {
    products: data.products.edges.map((edge) => toSitemapEntry(edge.node)),
    collections: data.collections.edges.map((edge) =>
      toSitemapEntry(edge.node),
    ),
  };
}

/**
 * An Online Store page by handle, or null when it is missing or empty —
 * the route then 404s instead of showing invented content. Shopify translates
 * the title/body for the request's language (falls back to English).
 */
export async function getPage(handle: string, locale: Locale): Promise<ContentPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>({
    query: PAGE_QUERY,
    variables: { handle },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });
  // An empty page (Admin creates them blank) has nothing to show — treat it
  // like a missing one rather than render a title over a blank screen.
  return data.page?.body.trim() ? toContentPage(data.page, data.page.seo) : null;
}

/** Shop policy handles the Storefront API exposes, mapped to their `shop` field. */
export const POLICY_HANDLES = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
] as const;
export type PolicyHandle = (typeof POLICY_HANDLES)[number];

const POLICY_FIELD = {
  "privacy-policy": "privacyPolicy",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
  "terms-of-service": "termsOfService",
} as const satisfies Record<PolicyHandle, keyof ShopifyShopPolicies["shop"]>;

/** A shop policy, or null while it is empty in Admin → Settings → Policies. */
export async function getShopPolicy(
  handle: PolicyHandle,
  locale: Locale,
): Promise<ContentPage | null> {
  const data = await shopifyFetch<ShopifyShopPolicies>({
    query: SHOP_POLICIES_QUERY,
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });
  const policy = data.shop[POLICY_FIELD[handle]];
  return policy?.body ? toContentPage({ ...policy, handle }) : null;
}

/**
 * For each top-level item of a Shopify menu, its direct children that link to
 * a collection (title as the menu names it, plus the collection's image when it
 * has one) — index-aligned with `getMenu`'s result. Children that aren't linked
 * to a collection yet are dropped, so nothing in the UI is a dead link.
 */
export async function getMenuCollectionTiles(
  handle: string,
  locale: Locale,
): Promise<CategoryTile[][]> {
  const data = await shopifyFetch<{ menu: ShopifyMainMenuCollections | null }>({
    query: MAIN_MENU_COLLECTIONS_QUERY,
    variables: { handle },
    locale,
    revalidate: CONTENT_REVALIDATE_SECONDS,
  });

  return (data.menu?.items ?? []).map((top) =>
    top.items.flatMap((item) => {
      const resource = item.resource;
      if (!resource || !("handle" in resource)) return [];
      return [
        {
          id: resource.id,
          title: item.title,
          handle: resource.handle,
          imageUrl: resource.image?.url ?? null,
          imageAlt: resource.image?.altText ?? item.title,
        },
      ];
    }),
  );
}
