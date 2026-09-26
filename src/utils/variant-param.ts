import type { ProductVariant } from "@/types/product";

/** The `?variant=` value for a variant — Shopify's own convention, the numeric
 * tail of its `gid://shopify/ProductVariant/123` id. */
export const toVariantParam = (variantId: string) => variantId.split("/").pop() ?? variantId;

export function findVariantByParam(
  variants: ProductVariant[],
  param: string | null,
): ProductVariant | null {
  if (!param) return null;
  return variants.find((variant) => toVariantParam(variant.id) === param) ?? null;
}
