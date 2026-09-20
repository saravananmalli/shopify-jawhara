"use client";

import { useEffect, useState } from "react";
import ProductCarousel from "@/components/ui/ProductCarousel";
import ProductShelf from "@/components/ui/ProductShelf";
import { ProductCarouselSkeleton } from "@/components/ui/Skeleton";
import { getProductsByIds } from "@/services/shopify";
import type { Product } from "@/types/product";

const STORAGE_KEY = "jawhara_recently_viewed";
const MAX_STORED = 12;

type Status = "idle" | "loading" | "ready" | "error";

/**
 * Only product IDs are stored (not a price/availability snapshot), so what's
 * shown is always re-fetched live from Shopify. Client-only and per-browser,
 * like the wishlist — there's no customer account to sync it to.
 */
export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let cancelled = false;

    // Deferred to a microtask so setState doesn't run synchronously within
    // the effect body (same pattern as the wishlist store's hydration).
    Promise.resolve().then(async () => {
      let stored: string[] = [];
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(parsed)) {
          stored = parsed.filter((id): id is string => typeof id === "string");
        }
      } catch {
        // Corrupt or blocked storage — treat as no history.
      }

      const others = stored.filter((id) => id !== currentProductId);
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([currentProductId, ...others].slice(0, MAX_STORED))
        );
      } catch {
        // Storage unavailable (private mode, quota) — history stays session-only.
      }

      if (cancelled) return;
      if (others.length === 0) {
        setProducts([]);
        setStatus("idle");
        return;
      }

      setStatus("loading");
      try {
        const result = await getProductsByIds(others);
        if (cancelled) return;
        setProducts(result);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentProductId]);

  if (status === "idle" || (status === "ready" && products.length === 0)) return null;

  return (
    <ProductShelf title="Recently Viewed">
      {status === "loading" && (
        <ProductCarouselSkeleton label="Loading recently viewed products…" />
      )}
      {status === "error" && (
        <p role="alert" className="font-sans text-sm text-error-700">
          Couldn&rsquo;t load your recently viewed products.
        </p>
      )}
      {status === "ready" && <ProductCarousel products={products} />}
    </ProductShelf>
  );
}
