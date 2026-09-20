const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION;

if (!storeDomain || !storefrontToken || !apiVersion) {
  throw new Error(
    "Missing Shopify Storefront env vars. Required: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN, NEXT_PUBLIC_SHOPIFY_API_VERSION."
  );
}

// Interpolated into request URLs and the CSP, so it must be a bare hostname.
if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(storeDomain)) {
  throw new Error(
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN must be a bare hostname (no protocol, path or port)."
  );
}

export const shopifyConfig = {
  storeDomain,
  storefrontToken,
  apiVersion,
  /**
   * Login and order history live on Shopify's hosted customer accounts (the
   * supported route for a headless storefront — no login code of ours handles
   * passwords). Shopify redirects `/account` to the shop's customer account
   * sign-in. The Storefront API's `shop.customerAccountUrl` is null on this
   * store, so switch to it if a customer-account vanity domain is configured.
   */
  accountUrl: `https://${storeDomain}/account`,
} as const;
