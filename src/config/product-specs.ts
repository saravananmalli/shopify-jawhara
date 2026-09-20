/**
 * The product "Specification" grid — one entry per Shopify product metafield
 * (Admin → Settings → Custom data → Products). `key` must match the
 * definition's key exactly, and the definition needs Storefront access
 * enabled or the Storefront API returns null for it.
 *
 * To show a new spec, add one line here: only specs a product has a value for
 * are rendered, in this order. `icon` is optional.
 */
export const PRODUCT_SPEC_NAMESPACE = "custom";

export type ProductSpecField = {
  key: string;
  label: string;
  icon?: string;
};

export const PRODUCT_SPEC_FIELDS: readonly ProductSpecField[] = [
  { key: "collection", label: "Collection", icon: "/brand/icons/brand.png" },
  { key: "sku", label: "SKU", icon: "/brand/icons/sku.png" },
  // Shopify Admin names differ from the keys: Metal Type = `metal`,
  // Diamond Clarity = `purity`, Diamond Color = `gemstone`, Diamond Ct = `specifications`.
  { key: "metal", label: "Metal Type", icon: "/brand/icons/metal-type.png" },
  { key: "color", label: "Color", icon: "/brand/icons/color.png" },
  { key: "purity", label: "Diamond Clarity", icon: "/brand/icons/diamond-clarity.png" },
  { key: "gemstone", label: "Diamond Color", icon: "/brand/icons/diamond-color.png" },
  { key: "specifications", label: "Diamond Ct", icon: "/brand/icons/diamond-ct.png" },
  { key: "gross_weight", label: "Gross Weight", icon: "/brand/icons/gross-weight.png" },
];
