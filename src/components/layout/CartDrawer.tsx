"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import Price from "@/components/ui/Price";
import CartLine from "@/components/layout/CartLine";
import { CartLinesSkeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/store/cart";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CloseIcon, BagIcon } from "@/components/icons";

export default function CartDrawer({ visible }: { visible: boolean }) {
  const { cart, closeCart, isInitializing, error, dismissError } = useCart();
  const { cart: t, errors } = useDictionary();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lines = cart?.lines ?? [];

  useFocusTrap(drawerRef, visible, closeCart);

  return (
    <div
      inert={!visible}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxury ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.bagLabel}
        className={`absolute end-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-xl transition-transform duration-300 ease-luxury ${
          visible ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg text-gold-600">
            <BagIcon className="h-5 w-5" />{" "}
            {formatMessage(t.title, { count: cart?.totalQuantity ?? 0 })}
          </h2>
          <button
            onClick={closeCart}
            aria-label={t.close}
            className="-me-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-error-100 bg-error-50 px-5 py-3 text-sm text-error-700"
          >
            <span>{error}</span>
            <button
              onClick={dismissError}
              aria-label={t.dismissError}
              className="-me-2 flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isInitializing ? (
            <CartLinesSkeleton />
          ) : lines.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gold-100 bg-white px-4 py-16 text-center">
              <BagIcon className="mx-auto h-8 w-8 text-brown-900/30" />
              <h3 className="mt-3 font-sans text-base text-brown-900">{t.emptyTitle}</h3>
              <p className="mx-auto mt-2 max-w-[15rem] font-sans text-sm text-brown-900/60">
                {t.emptyBody}
              </p>
              <Button
                href="/collections"
                variant="primary"
                className="mt-6 px-6 py-3 text-sm font-medium"
              >
                {errors.browseCollections}
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className="border-t border-gold-100 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brown-900/60">{t.subtotal}</span>
              <span className="font-semibold">
                <Price amount={cart.subtotal.amount} currencyCode={cart.subtotal.currencyCode} />
              </span>
            </div>
            <p className="mt-1 text-xs text-brown-900/50">{t.shippingNote}</p>
            <Button
              href={cart.checkoutUrl}
              variant="primary"
              fullWidth
              className="mt-3 py-3 text-center text-sm font-semibold uppercase tracking-wide"
            >
              {t.checkout}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
