import { PRODUCT_SPEC_FIELDS } from "@/config/product-specs";
import { formatMetafieldValue, formatMoney } from "@/utils/format";
import { brandName } from "@/config/site";
import { isSafeCheckoutUrl, toSafeInternalPath } from "@/utils/safe-url";
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
  HeroBanner,
  NavLink,
  Occasion,
  SitemapEntry,
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
  ShopifyProductDetail,
  ShopifySitemapNode,
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

export function toProductDetail(product: ShopifyProductDetail): ProductDetail {
  const specValues = new Map(
    product.specs.flatMap((spec) =>
      spec ? [[spec.key, formatMetafieldValue(spec.type, spec.value)] as const] : []
    )
  );
  // SKU: the product-level metafield if set, else the first variant's SKU
  // (where Shopify natively keeps it). The grid shows one static value — it
  // doesn't re-render per selected variant.
  if (!specValues.get("sku")) {
    const variantSku = product.variants.edges[0]?.node.sku;
    if (variantSku) specValues.set("sku", variantSku);
  }

  return {
    ...toProduct(product),
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
  return items.map((item) => ({
    title: item.title,
    url: toRelativeUrl(item.url),
    items: toNavLinks(item.items ?? []),
  }));
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
