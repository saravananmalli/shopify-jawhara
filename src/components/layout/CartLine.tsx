"use client";

import { useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import Price from "@/components/ui/Price";
import { useCart } from "@/store/cart";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { getShopifyImageUrl } from "@/utils/shopify-image";
import type { CartLine as CartLineType } from "@/types/cart";

// 2x the fixed 80x80 thumbnail.
const CART_LINE_IMAGE_WIDTH = 192;

/** One row in the bag drawer. Quantity/remove are optimistic and scoped to
 * this line only — an in-flight change here never disables any other line,
 * unlike the old single drawer-wide loading flag. */
export default function CartLine({ line }: { line: CartLineType }) {
  const { updateItem, removeItem } = useCart();
  const { cart: t } = useDictionary();
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(line.quantity);
  const [isPending, startTransition] = useTransition();
  const [removing, setRemoving] = useState(false);

  function change(next: number) {
    startTransition(async () => {
      setOptimisticQuantity(next);
      try {
        if (next <= 0) {
          setRemoving(true);
          await removeItem(line.id);
        } else {
          await updateItem(line.id, next);
        }
      } catch {
        // Surfaced via the cart store's error state (shown in CartDrawer).
        setRemoving(false);
      }
    });
  }

  return (
    <li
      className={`flex gap-3 rounded-2xl border border-[#E6D7BE]/60 bg-white p-3 shadow-sm transition-[opacity,max-height] duration-(--motion-fast) ease-luxury ${
        removing ? "pointer-events-none max-h-0 overflow-hidden opacity-0" : "max-h-96 opacity-100"
      }`}
    >
      <Link
        href={`/products/${line.productHandle}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gold-100 bg-cream-50"
      >
        {line.image && (
          <Image
            src={getShopifyImageUrl(line.image.url, CART_LINE_IMAGE_WIDTH)}
            alt={line.image.altText}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/products/${line.productHandle}`}
          dir="auto"
          className="text-sm font-medium text-brown-900 hover:text-gold-700"
        >
          {line.productTitle}
        </Link>
        {line.variantTitle && (
          <p className="text-xs text-brown-900/50">{line.variantTitle}</p>
        )}
        <p className="text-sm font-semibold text-gold-700">
          <Price amount={line.lineTotal.amount} currencyCode={line.lineTotal.currencyCode} />
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex h-7 items-center rounded-full bg-cream-100">
            <button
              type="button"
              disabled={isPending}
              aria-label={formatMessage(t.decrease, { title: line.productTitle })}
              onClick={() => change(optimisticQuantity - 1)}
              className="flex h-full w-6 items-center justify-center text-sm leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="min-w-[1.25rem] text-center text-xs font-semibold text-brown-900"
            >
              {optimisticQuantity}
            </span>
            <button
              type="button"
              disabled={isPending}
              aria-label={formatMessage(t.increase, { title: line.productTitle })}
              onClick={() => change(optimisticQuantity + 1)}
              className="flex h-full w-6 items-center justify-center text-sm leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => change(0)}
            className="text-xs text-brown-900/50 underline underline-offset-2 transition-colors hover:text-error-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
