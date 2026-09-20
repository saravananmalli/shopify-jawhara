"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/types/product";
import type { WishlistItem } from "@/types/wishlist";

const WISHLIST_STORAGE_KEY = "jawhara_wishlist";

const MAX_WISHLIST_ITEMS = 200;

/** localStorage is editable by the shopper (or leftover from an older build),
 * so re-check the shape and drop anything that could reach a link or image. */
function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const image = item.image as Record<string, unknown> | null | undefined;
  const price = item.price as Record<string, unknown> | null | undefined;
  return (
    typeof item.id === "string" &&
    typeof item.handle === "string" &&
    /^[\w-]{1,255}$/.test(item.handle) &&
    typeof item.title === "string" &&
    (image === null ||
      (typeof image === "object" &&
        typeof image.url === "string" &&
        image.url.startsWith("https://cdn.shopify.com/") &&
        typeof image.altText === "string")) &&
    !!price &&
    typeof price === "object" &&
    typeof price.amount === "number" &&
    typeof price.currencyCode === "string" &&
    typeof price.formatted === "string"
  );
}

type WishlistContextValue = {
  items: WishlistItem[];
  /** False until localStorage has been read — "empty" isn't known before that. */
  hydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Client-only, localStorage-backed — there's no customer auth/account flow
 * yet, so this can't sync to a Shopify customer wishlist. Session-level
 * global state, same tier as cart.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deferred to a microtask so setState doesn't run synchronously within
    // the effect body (matches the getCart().then() pattern in store/cart.tsx).
    Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isWishlistItem).slice(0, MAX_WISHLIST_ITEMS));
        }
      } catch {
        // Corrupt or blocked storage — start empty rather than throwing.
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode, quota) — wishlist stays session-only.
    }
  }, [items, hydrated]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items]
  );

  const toggleItem = useCallback((product: Product) => {
    setItems((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }
      return [
        ...current,
        {
          id: product.id,
          handle: product.handle,
          title: product.title,
          image: product.image,
          price: product.price,
        },
      ];
    });
  }, []);

  const value = useMemo(
    () => ({ items, hydrated, isInWishlist, toggleItem }),
    [items, hydrated, isInWishlist, toggleItem],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
