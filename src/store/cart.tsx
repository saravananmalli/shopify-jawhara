"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCartLines,
  CartUserError,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
} from "@/services/shopify";
import { useDictionary, useLocale } from "@/store/locale";
import type { Cart } from "@/types/cart";

const CART_ID_KEY = "jawhara_cart_id";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  /** True only while the cart saved in localStorage from a previous visit is
   * being fetched on mount — lets the drawer show a skeleton instead of a
   * flash of "empty" before that first fetch resolves. */
  isInitializing: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  dismissError: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const genericError = useDictionary().cart.genericError;
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real Shopify-authored copy (e.g. an actual stock-limit message) when
  // available, the existing generic string otherwise — never a leaked
  // internal message (our own input validation, a raw network failure).
  const handleError = useCallback(
    (err: unknown) => {
      setError(err instanceof CartUserError ? err.message : genericError);
    },
    [genericError],
  );

  useEffect(() => {
    const existingId = window.localStorage.getItem(CART_ID_KEY);
    if (!existingId) return;

    // Deferred (not called directly in the effect body) so the loading flag
    // is set from a callback rather than synchronously during the effect —
    // same convention as SearchOverlay's debounced fetch.
    const timer = setTimeout(async () => {
      setIsInitializing(true);
      try {
        const existingCart = await getCart(existingId, locale);
        if (existingCart) setCart(existingCart);
        else window.localStorage.removeItem(CART_ID_KEY);
      } catch {
        window.localStorage.removeItem(CART_ID_KEY);
      } finally {
        setIsInitializing(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [locale]);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        let activeCart = cart;
        if (!activeCart) {
          activeCart = await createCart(locale);
          window.localStorage.setItem(CART_ID_KEY, activeCart.id);
        }
        const updated = await addCartLines(
          activeCart.id,
          [{ merchandiseId, quantity }],
          locale,
        );
        setCart(updated);
        setIsOpen(true);
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart, locale, handleError]
  );

  // Not `isLoading` — that's for cart-wide operations (addItem, driving the
  // "Add to Bag" buttons all over the site). Quantity/remove are per-line
  // operations the drawer tracks itself (optimistically, via useOptimistic
  // in CartLine), so they don't need to block anything else while pending.
  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setError(null);
      try {
        const updated = await updateCartLines(
          cart.id,
          [{ id: lineId, quantity }],
          locale,
        );
        setCart(updated);
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [cart, locale, handleError]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setError(null);
      try {
        const updated = await removeCartLines(cart.id, [lineId], locale);
        setCart(updated);
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [cart, locale, handleError]
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const dismissError = useCallback(() => setError(null), []);

  // Memoised so the many AddToCartButtons on a listing page re-render only
  // when cart state actually changes, not whenever the provider re-renders.
  const value = useMemo(
    () => ({
      cart,
      isOpen,
      isLoading,
      isInitializing,
      error,
      openCart,
      closeCart,
      dismissError,
      addItem,
      updateItem,
      removeItem,
    }),
    [cart, isOpen, isLoading, isInitializing, error, openCart, closeCart, dismissError, addItem, updateItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
