import { createStorefrontClient } from "@shopify/hydrogen-react";
import { shopifyConfig } from "@/config/shopify";

const { getStorefrontApiUrl, getPublicTokenHeaders } = createStorefrontClient({
  storeDomain: `https://${shopifyConfig.storeDomain}`,
  publicStorefrontToken: shopifyConfig.storefrontToken,
  storefrontApiVersion: shopifyConfig.apiVersion,
});

export class ShopifyApiError extends Error {}

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  /** Seconds to cache for. Omit for commerce-fresh data (products, cart).
   * Pass a value for stable content (brand, nav, collections) — rule #22. */
  revalidate?: number;
}): Promise<T> {
  const res = await fetch(getStorefrontApiUrl(), {
    method: "POST",
    headers: getPublicTokenHeaders(),
    body: JSON.stringify({ query, variables }),
    ...(revalidate !== undefined && { next: { revalidate } }),
  });

  if (!res.ok) {
    throw new ShopifyApiError(
      `Shopify Storefront API request failed with status ${res.status}`
    );
  }

  const json = await res.json();

  if (json.errors) {
    throw new ShopifyApiError(
      json.errors.map((e: { message: string }) => e.message).join("\n")
    );
  }

  return json.data as T;
}
