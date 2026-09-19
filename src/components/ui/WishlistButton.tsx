"use client";

import { useWishlist } from "@/store/wishlist";
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
  const inWishlist = isInWishlist(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(product)}
      aria-pressed={inWishlist}
      aria-label={`${inWishlist ? "Remove" : "Add"} ${product.title} ${
        inWishlist ? "from" : "to"
      } wishlist`}
      className={`${className} ${
        inWishlist ? "text-maroon-500" : "text-brown-900/60 hover:text-maroon-500"
      }`}
    >
      <HeartIcon filled={inWishlist} className={iconClassName} />
    </button>
  );
}
