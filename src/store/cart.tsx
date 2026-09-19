"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
} from "@/services/shopify";
import type { Cart } from "@/types/cart";

const CART_ID_KEY = "jawhara_cart_id";
const GENERIC_ERROR = "Something went wrong with your bag. Please try again.";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
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
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingId = window.localStorage.getItem(CART_ID_KEY);
    if (!existingId) return;

    getCart(existingId)
      .then((existingCart) => {
        if (existingCart) setCart(existingCart);
        else window.localStorage.removeItem(CART_ID_KEY);
      })
      .catch(() => window.localStorage.removeItem(CART_ID_KEY));
  }, []);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        let activeCart = cart;
        if (!activeCart) {
          activeCart = await createCart();
          window.localStorage.setItem(CART_ID_KEY, activeCart.id);
        }
        const updated = await addCartLines(activeCart.id, [
          { merchandiseId, quantity },
        ]);
        setCart(updated);
        setIsOpen(true);
      } catch (err) {
        setError(GENERIC_ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setIsLoading(true);
      setError(null);
      try {
        const updated = await updateCartLines(cart.id, [
          { id: lineId, quantity },
        ]);
        setCart(updated);
      } catch (err) {
        setError(GENERIC_ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setIsLoading(true);
      setError(null);
      try {
        const updated = await removeCartLines(cart.id, [lineId]);
        setCart(updated);
      } catch (err) {
        setError(GENERIC_ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        error,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        dismissError: () => setError(null),
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
