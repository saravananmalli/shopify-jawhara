"use client";

import { useRef } from "react";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CloseIcon, BagIcon } from "@/components/icons";
import { getShopifyImageUrl } from "@/utils/shopify-image";

// 2x the fixed 80x80 thumbnail.
const CART_LINE_IMAGE_WIDTH = 192;

export default function CartDrawer({ visible }: { visible: boolean }) {
  const { cart, closeCart, updateItem, removeItem, isLoading, error, dismissError } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lines = cart?.lines ?? [];

  useFocusTrap(drawerRef, visible, closeCart);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxury ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-xl transition-transform duration-300 ease-luxury ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg text-gold-600">
            <BagIcon className="h-5 w-5" /> Your Bag ({cart?.totalQuantity ?? 0})
          </h2>
          <button onClick={closeCart} aria-label="Close bag">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-error-100 bg-error-50 px-5 py-3 text-sm text-error-700"
          >
            <span>{error}</span>
            <button onClick={dismissError} aria-label="Dismiss error" className="shrink-0">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="mt-10 text-center text-sm text-brown-900/60">
              Your bag is empty.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                    {line.image && (
                      <Image
                        src={getShopifyImageUrl(line.image.url, CART_LINE_IMAGE_WIDTH)}
                        alt={line.image.altText}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium">{line.productTitle}</p>
                    {line.variantTitle && (
                      <p className="text-xs text-brown-900/50">{line.variantTitle}</p>
                    )}
                    <p className="text-sm font-semibold text-gold-700">
                      {line.lineTotal.formatted}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-gold-100">
                        <button
                          disabled={isLoading}
                          aria-label={`Decrease quantity of ${line.productTitle}`}
                          onClick={() =>
                            line.quantity > 1
                              ? updateItem(line.id, line.quantity - 1)
                              : removeItem(line.id)
                          }
                          className="px-2.5 py-1 text-sm"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          disabled={isLoading}
                          aria-label={`Increase quantity of ${line.productTitle}`}
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          className="px-2.5 py-1 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        disabled={isLoading}
                        onClick={() => removeItem(line.id)}
                        className="text-xs text-brown-900/50 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className="border-t border-gold-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-brown-900/60">Subtotal</span>
              <span className="font-semibold">{cart.subtotal.formatted}</span>
            </div>
            <a
              href={cart.checkoutUrl}
              className="block w-full rounded-full bg-gold-600 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-gold-700"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
