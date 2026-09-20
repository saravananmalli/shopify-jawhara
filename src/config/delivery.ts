/**
 * Delivery promise by emirate. A storefront policy, not Shopify data —
 * Markets/shipping zones are country-level and the Storefront API exposes no
 * transit times — so it lives here. Display only: checkout doesn't enforce it.
 */
export const DELIVERY_TIME_ZONE = "Asia/Dubai";

/** Emirates that get same-day delivery on orders placed before the cutoff. */
export const SAME_DAY_EMIRATES: readonly string[] = ["Dubai"];

/** Orders placed at or after this hour (24h, Dubai time) ship next day. */
export const SAME_DAY_CUTOFF_HOUR = 14;

