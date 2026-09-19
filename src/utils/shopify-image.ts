const SHOPIFY_CDN_HOSTNAME = "cdn.shopify.com"; // keep in sync with next.config.ts remotePatterns

export function isShopifyCdnUrl(url: string): boolean {
  try {
    return new URL(url).hostname === SHOPIFY_CDN_HOSTNAME;
  } catch {
    return false;
  }
}

/**
 * Requests a Shopify CDN-resized copy instead of letting Next's
 * /_next/image optimizer download the full original first — a 4-5MB
 * metaobject-uploaded PNG timed out the optimizer before it could even
 * resize it (Shop by Occasion incident). Preserves existing query params
 * (Shopify's own `?v=...` cache-buster). No-ops for non-Shopify or
 * malformed URLs, so it's always safe to call unconditionally.
 */
export function getShopifyImageUrl(url: string, width: number): string {
  if (!isShopifyCdnUrl(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", String(Math.round(width)));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * True only for a remote URL on a host next.config.ts does NOT
 * allow-list (Next throws for those unless `unoptimized` is set). Never
 * true for Shopify's CDN — that's handled by pre-shrinking via
 * getShopifyImageUrl above, not by disabling optimization.
 */
export function isUntrustedRemoteImage(url: string): boolean {
  return url.startsWith("http") && !isShopifyCdnUrl(url);
}

/**
 * Shared placeholder (~270 bytes) for the large `fill`-based images —
 * a soft cream/gold tone matching globals.css tokens, not a per-image
 * blur-hash pipeline (not worth building for a one-time polish
 * requirement, and two orders of magnitude too small to be "embedding a
 * large image as base64").
 */
export const IMAGE_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwC0ASN//9k=";
