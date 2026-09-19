import type { Money } from "@/types/money";
import type { ProductImage } from "@/types/product";

/** Minimal snapshot stored per product — avoids persisting full variant/description payloads. */
export type WishlistItem = {
  id: string;
  handle: string;
  title: string;
  image: ProductImage | null;
  price: Money;
};
