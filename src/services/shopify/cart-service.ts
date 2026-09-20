import { ShopifyApiError, shopifyFetch } from "@/services/shopify/client";
import { toCart } from "@/services/shopify/adapters";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
} from "@/graphql/mutations";
import { CART_QUERY } from "@/graphql/queries";
import type { Cart } from "@/types/cart";
import type { ShopifyCart } from "@/types/shopify-api";

type UserError = { field: string[] | null; message: string };

// Prices, totals and stock are never sent by the client — Shopify computes
// them from the variant ID. Quantity is the only client-supplied number, so
// reject non-integers/absurd values here instead of relying on the API alone.
const MAX_LINE_QUANTITY = 99;

const CART_ID_PATTERN = /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_-]+(\?key=[A-Za-z0-9_-]+)?$/;
const VARIANT_ID_PATTERN = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

/** Cart IDs are bearer credentials kept in localStorage, so a tampered value
 * must be rejected before it is used as a GraphQL variable. */
export const isValidCartId = (id: string) => CART_ID_PATTERN.test(id);

function assertQuantity(quantity: number, { allowZero }: { allowZero: boolean }) {
  const min = allowZero ? 0 : 1;
  if (!Number.isInteger(quantity) || quantity < min || quantity > MAX_LINE_QUANTITY) {
    throw new ShopifyApiError("Invalid cart quantity");
  }
}

function assertCartId(cartId: string) {
  if (!isValidCartId(cartId)) throw new ShopifyApiError("Invalid cart id");
}

function assertNoUserErrors(userErrors: UserError[]) {
  if (userErrors.length > 0) {
    throw new ShopifyApiError(userErrors.map((e) => e.message).join("\n"));
  }
}

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
    query: CART_CREATE_MUTATION,
  });

  return toCart(data.cartCreate.cart);
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  assertCartId(cartId);
  for (const line of lines) {
    if (!VARIANT_ID_PATTERN.test(line.merchandiseId)) {
      throw new ShopifyApiError("Invalid variant id");
    }
    assertQuantity(line.quantity, { allowZero: false });
  }
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart; userErrors: UserError[] };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
  });

  assertNoUserErrors(data.cartLinesAdd.userErrors);
  return toCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  assertCartId(cartId);
  for (const line of lines) assertQuantity(line.quantity, { allowZero: true });
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart; userErrors: UserError[] };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
  });

  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  return toCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  assertCartId(cartId);
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: UserError[] };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
  });

  assertNoUserErrors(data.cartLinesRemove.userErrors);
  return toCart(data.cartLinesRemove.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  assertCartId(cartId);
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: CART_QUERY,
    variables: { cartId },
  });

  return data.cart ? toCart(data.cart) : null;
}
