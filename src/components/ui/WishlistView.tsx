"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { PRODUCT_GRID_CLASS } from "@/config/layout";
import { getProductsByIds } from "@/services/shopify";
import { useWishlist } from "@/store/wishlist";
import { useDictionary, useLocale } from "@/store/locale";
import { pluralize } from "@/utils/i18n";
import type { Product } from "@/types/product";

type Status = "loading" | "ready" | "error";

/**
 * The saved list is only ids in this browser; every card shown is re-fetched
 * from Shopify, so price, availability and delivery are live — not the
 * snapshot taken when the heart was tapped. Products that were unpublished
 * since simply drop out.
 */
export default function WishlistView() {
  const locale = useLocale();
  const { wishlist: t, errors } = useDictionary();
  const { items, hydrated } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  // Re-fetch only when the set of saved ids changes, not on every render.
  const idsKey = items.map((item) => item.id).join(",");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    // Deferred to a microtask so setState doesn't run synchronously within
    // the effect body (same pattern as RecentlyViewed).
    Promise.resolve().then(async () => {
      if (idsKey === "") {
        if (!cancelled) {
          setProducts([]);
          setStatus("ready");
        }
        return;
      }
      setStatus("loading");
      try {
        const result = await getProductsByIds(idsKey.split(","), locale);
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
  }, [hydrated, idsKey, locale, attempt]);

  if (!hydrated || status === "loading") {
    return <ProductGridSkeleton count={4} className="mt-8" />;
  }

  if (status === "error") {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-dashed border-gold-100 bg-white px-4 py-12 text-center">
        <p className="font-sans text-base text-brown-900">{t.loadError}</p>
        <Button
          variant="primary"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-4 h-10 px-6 text-sm font-medium"
        >
          {t.retry}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-gold-100 bg-white px-4 py-16 text-center">
        <h2 className="font-sans text-lg text-brown-900">{t.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-brown-900/60">{t.emptyBody}</p>
        <Button
          href="/collections"
          variant="primary"
          className="mt-6 px-6 py-3 text-sm font-medium"
        >
          {errors.browseCollections}
        </Button>
      </div>
    );
  }

  return (
    <>
      <p aria-live="polite" className="mt-6 font-sans text-sm text-brown-900/60">
        {pluralize(locale, products.length, t.count)}
      </p>
      <ul className={`mt-4 ${PRODUCT_GRID_CLASS}`}>
        {products.map((product) => (
          <li key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
