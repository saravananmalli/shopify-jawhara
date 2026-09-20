import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
if (shopifyDomain && !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(shopifyDomain)) {
  // Same rule as src/config/shopify.ts — this value is written into the CSP.
  throw new Error("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN must be a bare hostname.");
}

/**
 * The browser talks to exactly one third-party origin: the Shopify Storefront
 * API (cart, search and tab switches run client-side). Images come from
 * Shopify's CDN; fonts are self-hosted by next/font; checkout is a top-level
 * navigation, which CSP doesn't restrict.
 *
 * `'unsafe-inline'` for scripts is a deliberate trade-off: Next's bootstrap
 * and the JSON-LD blocks are inline, and per-request nonces would force every
 * page to render dynamically, defeating the ISR caching this store relies on.
 * The rest of the policy (object-src, base-uri, form-action, frame-ancestors,
 * connect-src, no remote scripts) still closes the common exfiltration and
 * injection routes. Move to nonces if pages ever become fully dynamic.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com",
  "font-src 'self'",
  `connect-src 'self' ${shopifyDomain ? `https://${shopifyDomain} ` : ""}${isDev ? "ws://localhost:* " : ""}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // geolocation stays on for the "use my location" delivery picker.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        // Product/collection/metaobject images all live under /s/files; this
        // keeps the optimizer from being pointed at arbitrary CDN paths.
        pathname: "/s/files/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Shopify file URLs carry a `?v=` version that changes when an image is
    // replaced, so optimized copies can be kept for a month instead of the
    // 4h default — far fewer re-optimizations for repeat visitors.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Sources are pre-shrunk to <=1920px by getShopifyImageUrl, so the default
    // 2048/3840 candidates would only bloat every srcset with sizes that can
    // never be sharper.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
