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

type WishlistContextValue = {
  items: WishlistItem[];
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
        if (raw) setItems(JSON.parse(raw));
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
    () => ({ items, isInWishlist, toggleItem }),
    [items, isInWishlist, toggleItem],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
