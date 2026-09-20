import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
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
