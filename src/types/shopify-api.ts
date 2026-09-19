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

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
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

export type ShopifyProductDetail = ShopifyProduct & {
  designCode: ShopifyMetaobjectField;
  brand: ShopifyMetaobjectField;
  metalType: ShopifyMetaobjectField;
  diamondClarity: ShopifyMetaobjectField;
  diamondColor: ShopifyMetaobjectField;
  diamondCt: ShopifyMetaobjectField;
  grossWeight: ShopifyMetaobjectField;
  color: ShopifyMetaobjectField;
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

export type ShopifyCollectionWithProducts = ShopifyCollection & {
  description: string;
  products: { edges: { node: ShopifyProduct }[] };
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

export type ShopifySitemapNode = {
  handle: string;
  updatedAt?: string | null;
};
