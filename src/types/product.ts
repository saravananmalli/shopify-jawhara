import type { Money } from "@/types/money";

export type ProductImage = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  available: boolean;
  price: Money;
  compareAtPrice: Money | null;
  options: { name: string; value: string }[];
};

/**
 * Frontend product model. Produced by services/shopify/adapters.ts from a
 * raw ShopifyProduct — components must never reach into Shopify's
 * priceRange/edges-and-nodes shape directly.
 */
export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  available: boolean;
  image: ProductImage | null;
  images: ProductImage[];
  price: Money;
  compareAtPrice: Money | null;
  defaultVariant: ProductVariant | null;
  variants: ProductVariant[];
  tags: string[];
};

/**
 * Custom per-product data — Shopify Admin → Settings → Custom data →
 * Products (namespace "custom"). Any field can be null if that product
 * hasn't had it filled in yet; the UI only renders the fields that exist.
 */
export type ProductSpecifications = {
  brand: string | null;
  sku: string | null;
  metalType: string | null;
  diamondClarity: string | null;
  diamondColor: string | null;
  diamondCt: string | null;
  grossWeight: string | null;
  color: string | null;
};

/** Product detail page only — see PRODUCT_DETAIL_FRAGMENT. */
export type ProductDetail = Product & {
  designCode: string | null;
  specifications: ProductSpecifications;
  breadcrumb: { title: string; handle: string }[];
};
