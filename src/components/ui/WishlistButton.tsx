"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useWishlist } from "@/store/wishlist";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { HeartIcon } from "@/components/icons";
import type { Product } from "@/types/product";

export default function WishlistButton({
  product,
  className = "",
  iconClassName = "h-4 w-4",
}: {
  product: Product;
  className?: string;
  iconClassName?: string;
}) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { product: t } = useDictionary();
  // The saved list lives in localStorage; until hydrated, render the same
  // "not saved" state the server did.
  const inWishlist = useHydrated() && isInWishlist(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(product)}
      aria-pressed={inWishlist}
      aria-label={formatMessage(inWishlist ? t.wishlistRemove : t.wishlistAdd, {
        title: product.title,
      })}
      className={`${className} ${
        inWishlist ? "text-maroon-500" : "text-brown-900/60 hover:text-maroon-500"
      }`}
    >
      <HeartIcon filled={inWishlist} className={iconClassName} />
    </button>
  );
}
