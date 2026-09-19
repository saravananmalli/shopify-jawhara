"use client";

import { useState } from "react";
import { QuestionIcon, ShareIcon } from "@/components/icons";
import type { Product } from "@/types/product";

const SUPPORT_EMAIL = "Contactus@jawharajewllery.ae";

/** Wishlist now lives next to the Add to Bag button (ProductInfo) — kept
 * out of this row to avoid showing it twice. */
export default function ProductActionsRow({ product }: { product: Product }) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        // User cancelled the native share sheet — not an error to surface.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

  return (
    <div className="grid grid-cols-2 gap-4 font-sans text-sm font-semibold">
      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Question about ${product.title}`)}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-gold-600 px-4 py-3 text-gold-600 transition-colors hover:bg-cream-100"
      >
        <QuestionIcon className="h-5 w-5 text-gold-600" />
        Ask a Question
      </a>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center justify-center gap-2 rounded-xl border border-gold-600 px-4 py-3 text-gold-600 transition-colors hover:bg-cream-100"
      >
        <ShareIcon className="h-5 w-5 text-gold-600" />
        {shared ? "Link Copied!" : "Share"}
      </button>
    </div>
  );
}
