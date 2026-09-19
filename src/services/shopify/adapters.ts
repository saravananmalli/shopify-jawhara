import { formatMoney } from "@/utils/format";
import type { Money } from "@/types/money";
import type { Product, ProductDetail, ProductImage, ProductVariant } from "@/types/product";
import type { Cart, CartLine } from "@/types/cart";
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
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyHeroBannerMetaobject,
  ShopifyImage,
  ShopifyMenuItem,
  ShopifyMoney,
  ShopifyOccasionMetaobject,
  ShopifyProduct,
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
  variant: ShopifyProduct["variants"]["edges"][number]["node"]
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

export function toProduct(product: ShopifyProduct): Product {
  const variants = product.variants.edges.map((edge) => toVariant(edge.node));
  const compareAtAmount = parseFloat(
    product.compareAtPriceRange.minVariantPrice.amount
  );
  const priceAmount = parseFloat(product.priceRange.minVariantPrice.amount);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    available: product.availableForSale,
    tags: product.tags,
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
  // SKU lives on the variant in Shopify's model, but the spec grid shows one
  // static value (matching the reference design, which doesn't re-render
  // the grid per variant) — the default/first variant's SKU.
  const sku = product.variants.edges[0]?.node.sku ?? null;

  return {
    ...toProduct(product),
    designCode: product.designCode?.value ?? null,
    specifications: {
      brand: product.brand?.value ?? null,
      sku,
      metalType: product.metalType?.value ?? null,
      diamondClarity: product.diamondClarity?.value ?? null,
      diamondColor: product.diamondColor?.value ?? null,
      diamondCt: product.diamondCt?.value ?? null,
      grossWeight: product.grossWeight?.value ?? null,
      color: product.color?.value ?? null,
    },
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

export function toCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: toMoney(cart.cost.subtotalAmount),
    total: toMoney(cart.cost.totalAmount),
    lines: cart.lines.edges.map((edge) => toCartLine(edge.node)),
  };
}

export function toBrand(shopName: string, brand: ShopifyBrand | null): Brand {
  return {
    name: shopName,
    logoUrl: brand?.logo?.image?.url ?? null,
    logoAlt: brand?.logo?.image?.altText ?? `${shopName} logo`,
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
function toRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return url;
  }
}

export function toCategoryTile(collection: ShopifyCollection): CategoryTile {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    imageUrl: collection.image?.url ?? null,
    imageAlt: collection.image?.altText ?? collection.title,
  };
}

export function toCollection(collection: ShopifyCollectionWithProducts): Collection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description,
    imageUrl: collection.image?.url ?? null,
    imageAlt: collection.image?.altText ?? collection.title,
    products: collection.products.edges.map((edge) => toProduct(edge.node)),
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
    href: node.href?.value ?? "/collections/all",
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
    ctaHref: node.ctaUrl?.value ?? "/collections/all",
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
