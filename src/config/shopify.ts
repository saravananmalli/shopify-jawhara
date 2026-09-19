const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION;

if (!storeDomain || !storefrontToken || !apiVersion) {
  throw new Error(
    "Missing Shopify Storefront env vars. Required: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN, NEXT_PUBLIC_SHOPIFY_API_VERSION."
  );
}

export const shopifyConfig = {
  storeDomain,
  storefrontToken,
  apiVersion,
} as const;
