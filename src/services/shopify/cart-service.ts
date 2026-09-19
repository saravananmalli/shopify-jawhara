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
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: CART_QUERY,
    variables: { cartId },
  });

  return data.cart ? toCart(data.cart) : null;
}
