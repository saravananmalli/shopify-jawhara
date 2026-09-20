/**
 * Raw Shopify Storefront API response shapes.
 * Never consumed directly by UI components — see types/product.ts and
 * types/cart.ts for the normalized models components should use.
 */

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

/** What list views request (PRODUCT_CARD_FRAGMENT). */
export type ShopifyProductCard = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  tags: string[];
  /** Judge.me's `reviews` metafields; null until a product has a published review. */
  rating: { value: string } | null;
  ratingCount: { value: string } | null;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney;
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: ShopifyMoney;
        compareAtPrice: ShopifyMoney | null;
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
};

/** Full product (PRODUCT_FRAGMENT) — the detail page's base. */
export type ShopifyProduct = ShopifyProductCard & {
  description: string;
};

export type ShopifyProductDetail = ShopifyProduct & {
  designCode: ShopifyMetaobjectField;
  // Order and nulls match the identifiers requested in PRODUCT_DETAIL_FRAGMENT.
  specs: ({ key: string; type: string; value: string } | null)[];
  collections: { edges: { node: { title: string; handle: string } }[] };
  variants: {
    edges: { node: ShopifyProduct["variants"]["edges"][number]["node"] & { sku: string } }[];
  };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoney;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: { edges: { node: ShopifyCartLine }[] };
};

export type ShopifyMenuItem = {
  title: string;
  url: string;
  items: ShopifyMenuItem[];
};

export type ShopifyBrand = {
  logo: { image: ShopifyImage | null } | null;
  slogan: string | null;
  shortDescription: string | null;
};

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  image: ShopifyImage | null;
};

export type ShopifyCollectionHeader = ShopifyCollection & {
  description: string;
};

export type ShopifyMetaobjectField<T = string | null> = { value: T } | null;

export type ShopifyHeroBannerMetaobject = {
  id: string;
  eyebrow: ShopifyMetaobjectField;
  englishLine: ShopifyMetaobjectField;
  arabicLine: ShopifyMetaobjectField;
  badgeLabel: ShopifyMetaobjectField;
  badgeValue: ShopifyMetaobjectField;
  href: ShopifyMetaobjectField;
  hasBakedInText: ShopifyMetaobjectField;
  displayOrder: ShopifyMetaobjectField;
  image: {
    reference: { image: ShopifyImage | null } | null;
  } | null;
};

export type ShopifyOccasionMetaobject = {
  id: string;
  title: ShopifyMetaobjectField;
  tagline: ShopifyMetaobjectField;
  description: ShopifyMetaobjectField;
  badgeLabel: ShopifyMetaobjectField;
  badgeText: ShopifyMetaobjectField;
  ctaLabel: ShopifyMetaobjectField;
  ctaUrl: ShopifyMetaobjectField;
  displayOrder: ShopifyMetaobjectField;
  active: ShopifyMetaobjectField;
  image: {
    reference: { image: ShopifyImage | null } | null;
  } | null;
};

export type ShopifyTestimonialMetaobject = {
  id: string;
  quote: ShopifyMetaobjectField;
  customerName: ShopifyMetaobjectField;
  detail: ShopifyMetaobjectField;
  rating: ShopifyMetaobjectField;
  displayOrder: ShopifyMetaobjectField;
  active: ShopifyMetaobjectField;
};

export type ShopifyStoreLocationMetaobject = {
  id: string;
  name: ShopifyMetaobjectField;
  address: ShopifyMetaobjectField;
  country: ShopifyMetaobjectField;
  region: ShopifyMetaobjectField;
  phone: ShopifyMetaobjectField;
  hours: ShopifyMetaobjectField;
  mapLink: ShopifyMetaobjectField;
  latitude: ShopifyMetaobjectField;
  longitude: ShopifyMetaobjectField;
  displayOrder: ShopifyMetaobjectField;
  active: ShopifyMetaobjectField;
};

export type ShopifySitemapNode = {
  handle: string;
  updatedAt?: string | null;
};

export type ShopifyFilter = {
  id: string;
  label: string;
  type: string;
  values: { id: string; label: string; count: number; input: string }[];
};

type ShopifyPageInfo = { hasNextPage: boolean; endCursor: string | null };

export type ShopifyCatalogCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  products: {
    pageInfo: ShopifyPageInfo;
    filters?: ShopifyFilter[];
    edges: { node: ShopifyProductCard }[];
  };
};

export type ShopifyCatalogSearch = {
  totalCount: number;
  pageInfo: ShopifyPageInfo;
  productFilters?: ShopifyFilter[];
  // Search nodes are a union; the `... on Product` fragment yields {} for non-products.
  edges: { node: ShopifyProductCard | Record<string, never> }[];
};

export type ShopifyCategoryMenuItem = {
  title: string;
  // Empty object when the item links to something other than a collection.
  resource:
    | { id: string; handle: string; image: ShopifyImage | null }
    | Record<string, never>
    | null;
};

type ShopifyTagScanNode = {
  id: string;
  tags: string[];
  collections: { nodes: { handle: string }[] };
  priceRange: { minVariantPrice: { amount: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string } };
};

export type ShopifyTagScanCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    filters?: ShopifyFilter[];
    nodes: ShopifyTagScanNode[];
  };
};

export type ShopifyTagScanSearch = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  productFilters?: ShopifyFilter[];
  // Search nodes are a union; non-products come back as {}.
  nodes: (ShopifyTagScanNode | Record<string, never>)[];
};

export type ShopifyMainMenuCollections = {
  items: {
    title: string;
    // Level 2 is a column heading (with `items`) or, in a flat menu, a link
    // itself — hence `resource` here as well.
    items: (ShopifyCategoryMenuItem & { items: ShopifyCategoryMenuItem[] })[];
  }[];
};
