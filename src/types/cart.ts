import type { Money } from "@/types/money";

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  productTitle: string;
  productHandle: string;
  image: { url: string; altText: string } | null;
  price: Money;
  lineTotal: Money;
};

/**
 * Frontend cart model. Produced by services/shopify/adapters.ts — components
 * consume flat `lines`, never Shopify's `lines.edges[].node.merchandise` shape.
 */
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
};
