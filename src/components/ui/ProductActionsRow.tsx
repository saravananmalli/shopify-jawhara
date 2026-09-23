"use client";

import { useState } from "react";
import { QuestionIcon, ShareIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import type { Product } from "@/types/product";

const SUPPORT_EMAIL = "Contactus@jawharajewllery.ae";

/** Wishlist now lives next to the Add to Bag button (ProductInfo) — kept
 * out of this row to avoid showing it twice. */
export default function ProductActionsRow({ product }: { product: Product }) {
  const { product: t } = useDictionary();
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
      <Button
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formatMessage(t.questionSubject, { title: product.title }))}`}
        variant="secondary"
        icon={<QuestionIcon className="h-5 w-5 text-gold-600" />}
        className="px-4 py-3"
      >
        {t.askQuestion}
      </Button>
      <Button
        variant="secondary"
        onClick={handleShare}
        icon={<ShareIcon className="h-5 w-5 text-gold-600" />}
        className="px-4 py-3"
      >
        {shared ? t.linkCopied : t.share}
      </Button>
    </div>
  );
}
