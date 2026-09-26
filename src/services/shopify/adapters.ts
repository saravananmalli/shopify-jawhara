import { PRODUCT_SPEC_FIELDS } from "@/config/product-specs";
import type { Locale } from "@/config/i18n";
import { inBand, type Band } from "@/utils/price-band";
import { formatMetafieldValue, formatMoney } from "@/utils/format";
import { brandName } from "@/config/site";
import { isSafeCheckoutUrl, isSafeHttpsUrl, toSafeInternalPath } from "@/utils/safe-url";
import type { Coordinates } from "@/utils/geo";
import type { Money } from "@/types/money";
import type { Product, ProductDetail, ProductImage, ProductVariant } from "@/types/product";
import type { Cart, CartLine } from "@/types/cart";
import type { RatingSummary } from "@/types/review";
import type {
  CatalogFilter,
  CatalogPage,
  CatalogSortKey,
} from "@/types/catalog";
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
  ShopifyCart,
  ShopifyCatalogCollection,
  ShopifyCatalogSearch,
  ShopifyCategoryMenuItem,
  ShopifyMainMenuCollections,
  ShopifyCollection,
  ShopifyCollectionHeader,
  ShopifyFilter,
  ShopifyHeroBannerMetaobject,
  ShopifyImage,
  ShopifyMenuItem,
  ShopifyMoney,
  ShopifyOccasionMetaobject,
  ShopifyProductCard,
  ShopifyProductVariants,
  ShopifyProductDetail,
  ShopifySitemapNode,
  ShopifyStoreLocationMetaobject,
  ShopifyTestimonialMetaobject,
} from "@/types/shopify-api";

export function toMoney(money: ShopifyMoney): Money {
  const amount = parseFloat(money.amount);
  return {
    amount,
    currencyCode: money.currencyCode,
    formatted: formatMoney(amount, money.currencyCode),
  };
}

function toImage(image: ShopifyImage, fallbackAlt: string): ProductImage {
  return {
    url: image.url,
    altText: image.altText ?? fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

function toVariant(
  variant: ShopifyProductCard["variants"]["edges"][number]["node"]
): ProductVariant {
  const compareAtAmount = variant.compareAtPrice
    ? parseFloat(variant.compareAtPrice.amount)
    : 0;
  const priceAmount = parseFloat(variant.price.amount);

  return {
    id: variant.id,
    title: variant.title,
    available: variant.availableForSale,
    price: toMoney(variant.price),
    compareAtPrice:
      variant.compareAtPrice && compareAtAmount > priceAmount
        ? toMoney(variant.compareAtPrice)
        : null,
    options: variant.selectedOptions,
    image: variant.image ? toImage(variant.image, variant.title) : null,
  };
}

/**
 * Judge.me writes `reviews.rating` as a JSON rating value and
 * `reviews.rating_count` as an integer. Null when either is missing or invalid.
 */
export function toRatingSummary(
  rating: { value: string } | null | undefined,
  ratingCount: { value: string } | null | undefined,
): RatingSummary | null {
  if (!rating?.value) return null;
  const count = Number(ratingCount?.value);
  if (!Number.isFinite(count) || count <= 0) return null;

  try {
    const average = Number(JSON.parse(rating.value).value);
    return Number.isFinite(average) ? { average, count } : null;
  } catch {
    return null;
  }
}

/** `description` is only requested on the detail page; list views get "". */
export function toProduct(
  product: ShopifyProductCard & { description?: string },
): Product {
  const variants = product.variants.edges.map((edge) => toVariant(edge.node));
  const compareAtAmount = parseFloat(
    product.compareAtPriceRange.minVariantPrice.amount
  );
  const priceAmount = parseFloat(product.priceRange.minVariantPrice.amount);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? "",
    available: product.availableForSale,
    tags: product.tags,
    rating: toRatingSummary(product.rating, product.ratingCount),
    image: product.featuredImage
      ? toImage(product.featuredImage, product.title)
      : null,
    images: product.images.edges.map((edge) =>
      toImage(edge.node, product.title)
    ),
    price: toMoney(product.priceRange.minVariantPrice),
    compareAtPrice:
      compareAtAmount > priceAmount
        ? toMoney(product.compareAtPriceRange.minVariantPrice)
        : null,
    defaultVariant: variants[0] ?? null,
    variants,
  };
}

/**
 * A price-range filter matches a product on its cheapest variant, but a card
 * shows the first variant's photo and quick-adds the first variant. When those
 * differ (a bridal set whose Earrings variant is the one in range), show and
 * sell the variant that matched: its price, photo and add-to-bag target.
 */
export function withCheapestVariant(
  product: Product,
  raw: ShopifyProductVariants["variants"],
  bands: Band[],
): Product {
  const variants = raw.edges.map((edge) => toVariant(edge.node));
  // Prefer the variants inside the band(s); a product listed there through
  // another rule keeps its overall cheapest.
  const inRange = variants.filter((variant) =>
    bands.some((band) => inBand(variant.price.amount, band)),
  );
  const cheapest = (inRange.length > 0 ? inRange : variants).reduce<ProductVariant | null>(
    (best, variant) => (!best || variant.price.amount < best.price.amount ? variant : best),
    null,
  );
  if (
    !cheapest ||
    (cheapest.id === product.defaultVariant?.id && cheapest.price.amount === product.price.amount)
  ) {
    return product;
  }
  return {
    ...product,
    price: cheapest.price,
    compareAtPrice: cheapest.compareAtPrice,
    available: cheapest.available,
    image: cheapest.image ?? product.image,
    defaultVariant: cheapest,
    variantPreselected: true,
  };
}

export function toProductDetail(product: ShopifyProductDetail, locale: Locale): ProductDetail {
  const specValues = new Map(
    product.specs.flatMap((spec) =>
      spec ? [[spec.key, formatMetafieldValue(spec.type, spec.value, locale)] as const] : []
    )
  );
  // SKU: the product-level metafield if set, else the first variant's SKU
  // (where Shopify natively keeps it). The grid shows one static value — it
  // doesn't re-render per selected variant.
  if (!specValues.get("sku")) {
    const variantSku = product.variants.edges[0]?.node.sku;
    if (variantSku) specValues.set("sku", variantSku);
  }

  const base = toProduct(product);
  // The gallery is capped at 8 photos, so a colour's own photo can fall outside
  // it — append any missing variant photo so selecting that colour can show it.
  const galleryUrls = new Set(base.images.map((image) => image.url));
  const variantImages = base.variants.flatMap((variant) =>
    variant.image && !galleryUrls.has(variant.image.url)
      ? (galleryUrls.add(variant.image.url), [variant.image])
      : []
  );

  return {
    ...base,
    images: [...base.images, ...variantImages],
    designCode: product.designCode?.value ?? null,
    specifications: PRODUCT_SPEC_FIELDS.flatMap((field) => {
      const value = specValues.get(field.key);
      return value ? [{ key: field.key, label: field.label, icon: field.icon ?? null, value }] : [];
    }),
    // "frontpage" is Shopify's own auto-created "Home page" collection —
    // every product tends to belong to it, but it's not a real
    // merchandising category, so it doesn't belong in a breadcrumb.
    breadcrumb: product.collections.edges
      .filter((edge) => edge.node.handle !== "frontpage")
      .map((edge) => ({ title: edge.node.title, handle: edge.node.handle })),
  };
}

function toCartLine(
  line: ShopifyCart["lines"]["edges"][number]["node"]
): CartLine {
  const price = toMoney(line.merchandise.price);
  return {
    id: line.id,
    quantity: line.quantity,
    variantId: line.merchandise.id,
    variantTitle:
      line.merchandise.title === "Default Title" ? "" : line.merchandise.title,
    productTitle: line.merchandise.product.title,
    productHandle: line.merchandise.product.handle,
    image: line.merchandise.product.featuredImage
      ? {
          url: line.merchandise.product.featuredImage.url,
          altText:
            line.merchandise.product.featuredImage.altText ??
            line.merchandise.product.title,
        }
      : null,
    price,
    lineTotal: {
      amount: price.amount * line.quantity,
      currencyCode: price.currencyCode,
      formatted: formatMoney(price.amount * line.quantity, price.currencyCode),
    },
  };
}

function assertSafeCheckoutUrl(url: string): string {
  // Fail closed: the drawer links straight to this, so a non-https value
  // (javascript:, data:) must never be rendered as the checkout button.
  if (!isSafeCheckoutUrl(url)) throw new Error("Shopify returned an unsafe checkout URL");
  return url;
}

export function toCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: assertSafeCheckoutUrl(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity,
    subtotal: toMoney(cart.cost.subtotalAmount),
    total: toMoney(cart.cost.totalAmount),
    lines: cart.lines.edges.map((edge) => toCartLine(edge.node)),
  };
}

export function toBrand(brand: ShopifyBrand | null): Brand {
  return {
    name: brandName,
    logoUrl: brand?.logo?.image?.url ?? null,
    logoAlt: brand?.logo?.image?.altText ?? `${brandName} logo`,
    slogan: brand?.slogan ?? null,
    shortDescription: brand?.shortDescription ?? null,
  };
}

export function toNavLinks(items: ShopifyMenuItem[]): NavLink[] {
  return items.map((item) => {
    const { url, badge } = splitCollectionBadge(toRelativeUrl(item.url));
    return {
      key: item.title.trim().toLowerCase(),
      title: item.title,
      url,
      badge,
      items: toNavLinks(item.items ?? []),
    };
  });
}

const COLLECTION_WITH_EXTRA_SEGMENT = /^(\/collections\/[a-z0-9-]+)\/([^/?#]+)\/?$/i;

/**
 * Shopify's menu editor has no dedicated "badge" field on a link, so an admin
 * picking a collection and then typing e.g. "New" into the link field saves
 * it as an extra URL segment ("/collections/filo-collection/New") rather than
 * a real page — this app's routing only understands the bare
 * "/collections/<handle>" path, so that segment would otherwise 404. Treat it
 * as a small label instead: peel it off into `badge` and correct the link to
 * the real collection page.
 */
function splitCollectionBadge(path: string): { url: string; badge?: string } {
  const match = path.match(COLLECTION_WITH_EXTRA_SEGMENT);
  if (!match) return { url: path };
  const badge = decodeURIComponent(match[2]).trim();
  return badge ? { url: match[1], badge } : { url: path };
}

/** Copies the default-language keys onto a translated menu. Shopify
 * translates menu titles in place (same items, same order), so position is
 * the pairing; if the shapes ever differ, the translated entry keeps its own
 * key rather than getting a wrong one. */
export function withDefaultLanguageKeys(translated: NavLink[], base: NavLink[]): NavLink[] {
  return translated.map((link, index) => {
    const original = base[index];
    if (!original || original.url !== link.url) return link;
    return {
      ...link,
      key: original.key,
      items: withDefaultLanguageKeys(link.items, original.items),
    };
  });
}

/** Shopify menu URLs are absolute (https://store.myshopify.com/...) —
 * convert to a relative path so Next.js <Link> handles them client-side. */
const toRelativeUrl = (url: string) => toSafeInternalPath(url, "/");

export function toCategoryTile(collection: ShopifyCollection): CategoryTile {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    imageUrl: collection.image?.url ?? null,
    imageAlt: collection.image?.altText ?? collection.title,
  };
}

export function toCollection(collection: ShopifyCollectionHeader): Collection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description,
    imageUrl: collection.image?.url ?? null,
    imageAlt: collection.image?.altText ?? collection.title,
  };
}

export function toHeroBanner(node: ShopifyHeroBannerMetaobject): HeroBanner {
  const image = node.image?.reference?.image ?? null;
  return {
    id: node.id,
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? node.eyebrow?.value ?? "",
    hasBakedInText: node.hasBakedInText?.value === "true",
    eyebrow: node.eyebrow?.value ?? "",
    arabicLine: node.arabicLine?.value ?? null,
    englishLine: node.englishLine?.value ?? "",
    badgeLabel: node.badgeLabel?.value ?? "",
    badgeValue: node.badgeValue?.value ?? "",
    href: toSafeInternalPath(node.href?.value, "/collections/all"),
  };
}

export function sortByDisplayOrder(
  nodes: ShopifyHeroBannerMetaobject[]
): ShopifyHeroBannerMetaobject[] {
  return [...nodes].sort(
    (a, b) =>
      Number(a.displayOrder?.value ?? 0) - Number(b.displayOrder?.value ?? 0)
  );
}

export function toOccasion(node: ShopifyOccasionMetaobject): Occasion {
  const image = node.image?.reference?.image ?? null;
  return {
    id: node.id,
    title: node.title?.value ?? "",
    tagline: node.tagline?.value ?? "",
    description: node.description?.value ?? "",
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? node.title?.value ?? "",
    badgeLabel: node.badgeLabel?.value ?? "",
    badgeText: node.badgeText?.value ?? "",
    ctaLabel: node.ctaLabel?.value ?? "",
    ctaHref: toSafeInternalPath(node.ctaUrl?.value, "/collections/all"),
  };
}

export function sortOccasionsByDisplayOrder(
  nodes: ShopifyOccasionMetaobject[]
): ShopifyOccasionMetaobject[] {
  return [...nodes].sort(
    (a, b) =>
      Number(a.displayOrder?.value ?? 0) - Number(b.displayOrder?.value ?? 0)
  );
}

export function toTestimonial(node: ShopifyTestimonialMetaobject): Testimonial {
  const rating = Number(node.rating?.value);
  return {
    id: node.id,
    quote: node.quote?.value ?? "",
    customerName: node.customerName?.value ?? "",
    detail: node.detail?.value ?? "",
    // Clamp so a bad Admin entry (0, 9, blank) can't render a nonsense star row.
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
  };
}

export function sortTestimonialsByDisplayOrder(
  nodes: ShopifyTestimonialMetaobject[]
): ShopifyTestimonialMetaobject[] {
  return [...nodes].sort(
    (a, b) =>
      Number(a.displayOrder?.value ?? 0) - Number(b.displayOrder?.value ?? 0)
  );
}

// Phone numbers pasted from Google Maps carry invisible bidi/format marks
// (e.g. U+202C) that break `tel:` links and leave stray gaps in the text.
const INVISIBLE_FORMAT_CHARS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const cleanText = (value: string | null | undefined) =>
  (value ?? "").replace(INVISIBLE_FORMAT_CHARS, "").trim();

export function toStoreLocation(
  node: ShopifyStoreLocationMetaobject,
  coordinates: Coordinates | null,
): StoreLocation {
  const mapLink = cleanText(node.mapLink?.value);
  return {
    id: node.id,
    name: cleanText(node.name?.value),
    address: cleanText(node.address?.value),
    country: cleanText(node.country?.value),
    region: cleanText(node.region?.value),
    phone: cleanText(node.phone?.value),
    hours: cleanText(node.hours?.value),
    mapLink: isSafeHttpsUrl(mapLink) ? mapLink : "",
    coordinates,
  };
}

/** Manual order first, then A–Z so stores without an order still list stably. */
export function sortStoreNodes(
  nodes: ShopifyStoreLocationMetaobject[]
): ShopifyStoreLocationMetaobject[] {
  return [...nodes].sort(
    (a, b) =>
      Number(a.displayOrder?.value ?? 0) - Number(b.displayOrder?.value ?? 0) ||
      (a.name?.value ?? "").localeCompare(b.name?.value ?? "")
  );
}

export function toSitemapEntry(node: ShopifySitemapNode): SitemapEntry {
  return { handle: node.handle, updatedAt: node.updatedAt ?? null };
}

const FILTER_TYPES = new Set(["LIST", "PRICE_RANGE", "BOOLEAN"]);

export function toCatalogFilters(filters: ShopifyFilter[] = []): CatalogFilter[] {
  return filters.flatMap((filter) => {
    if (!FILTER_TYPES.has(filter.type) || filter.values.length === 0) return [];
    return [
      {
        id: filter.id,
        label: filter.label,
        type: filter.type as CatalogFilter["type"],
        values: filter.values.map((value) => ({
          id: value.id,
          label: value.label,
          count: value.count,
          input: JSON.stringify(JSON.parse(value.input)),
        })),
      },
    ];
  });
}

export const COLLECTION_SORTS: CatalogSortKey[] = [
  "RECOMMENDED",
  "BEST_SELLING",
  "NEWEST",
  "PRICE_ASC",
  "PRICE_DESC",
];
export const SEARCH_SORTS: CatalogSortKey[] = ["RECOMMENDED", "PRICE_ASC", "PRICE_DESC"];

export function toCatalogPageFromCollection(
  collection: ShopifyCatalogCollection
): CatalogPage {
  const { products } = collection;
  return {
    collection: {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description,
    },
    products: products.edges.map((edge) => toProduct(edge.node)),
    filters: toCatalogFilters(products.filters),
    totalCount: null,
    hasNextPage: products.pageInfo.hasNextPage,
    endCursor: products.pageInfo.endCursor,
    supportedSorts: COLLECTION_SORTS,
  };
}

function isProductNode(
  node: ShopifyCatalogSearch["edges"][number]["node"]
): node is ShopifyProductCard {
  return "id" in node;
}

export function toCatalogPageFromSearch(
  search: ShopifyCatalogSearch,
  collection: { title: string; handle: string }
): CatalogPage {
  return {
    collection: { id: null, description: "", ...collection },
    products: search.edges.flatMap((edge) =>
      isProductNode(edge.node) ? [toProduct(edge.node)] : []
    ),
    filters: toCatalogFilters(search.productFilters),
    totalCount: search.totalCount,
    hasNextPage: search.pageInfo.hasNextPage,
    endCursor: search.pageInfo.endCursor,
    supportedSorts: SEARCH_SORTS,
  };
}

/**
 * The tile label is the menu item's own title (so merchants can rename it,
 * e.g. "Necklaces & Pendants"). Items that aren't collections, or whose
 * collection has no image, are skipped rather than rendered as blank tiles.
 */
export function toCategoryTilesFromMenu(items: ShopifyCategoryMenuItem[]): CategoryTile[] {
  return items.flatMap((item) => {
    const resource = item.resource;
    if (!resource || !("handle" in resource) || !resource.image) return [];
    return [
      {
        id: resource.id,
        title: item.title,
        handle: resource.handle,
        imageUrl: resource.image.url,
        imageAlt: resource.image.altText ?? item.title,
      },
    ];
  });
}

/**
 * The links in the first mega-menu column that contains `handle` (menu
 * order decides when a collection appears in several), or null when it's in
 * none. Includes the current collection itself so it shows as the selected tile.
 *
 * Only when no column has it, a flat menu (a top item whose children are all
 * plain links, like "Our Collections") is tried — so pages already found in a
 * column never change. The top item's title stands in for the column title.
 */
export function findMenuColumnItems(
  menu: ShopifyMainMenuCollections,
  handle: string
): { title: string; items: ShopifyCategoryMenuItem[] } | null {
  const isHandle = (item: ShopifyCategoryMenuItem) =>
    !!item.resource && "handle" in item.resource && item.resource.handle === handle;

  for (const top of menu.items) {
    for (const column of top.items) {
      if (column.items.some(isHandle)) return { title: column.title, items: column.items };
    }
  }

  for (const top of menu.items) {
    const isFlat = top.items.length > 0 && top.items.every((link) => link.items.length === 0);
    if (isFlat && top.items.some(isHandle)) {
      return { title: top.title, items: top.items };
    }
  }
  return null;
}

export function toContentPage(
  node: { handle: string; title: string; body: string },
  seo?: { title: string | null; description: string | null } | null,
): ContentPage {
  return {
    handle: node.handle,
    title: node.title,
    bodyHtml: node.body,
    seoTitle: seo?.title ?? null,
    seoDescription: seo?.description ?? null,
  };
}
