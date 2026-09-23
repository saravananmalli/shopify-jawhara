"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useDictionary } from "@/store/locale";
import { BagIcon, CheckIcon } from "@/components/icons";
import Button from "@/components/ui/Button";

export default function AddToCartButton({
  variantId,
  quantity = 1,
  className = "",
  label,
  iconOnly = false,
}: {
  variantId: string;
  quantity?: number;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const { addItem, isLoading } = useCart();
  const { product: t } = useDictionary();
  const buttonLabel = label ?? t.addToBag;
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = async () => {
    try {
      await addItem(variantId, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch {
      // Surfaced via the cart store's error state (shown in CartDrawer).
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        disabled={isLoading}
        onClick={handleClick}
        aria-label={justAdded ? t.addedToBag : buttonLabel}
        className={`flex items-center justify-center transition-colors disabled:opacity-60 ${className}`}
      >
        {justAdded ? <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <BagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      </button>
    );
  }

  return (
    <Button
      variant="primary"
      disabled={isLoading}
      onClick={handleClick}
      icon={<BagIcon className="h-3.5 w-3.5" />}
      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {justAdded ? t.added : buttonLabel}
    </Button>
  );
}
