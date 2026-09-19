"use client";

import Image from "next/image";
import Link from "next/link";
import { DirhamSymbol } from "dirham/react";
import AddToCartButton from "@/components/ui/AddToCartButton";
import WishlistButton from "@/components/ui/WishlistButton";
import Chip from "@/components/ui/Chip";
import { ArrowDownIcon, StarIcon, BagIcon } from "@/components/icons";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { Product } from "@/types/product";

// 2x the largest rendered width (25vw of the 1440px max-w-8xl container).
const PRODUCT_IMAGE_WIDTH = 800;

export default function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.price.amount / product.compareAtPrice.amount) * 100)
    : null;

  return (
    <div className="group relative flex flex-col rounded-3xl border border-[#E6D7BE]/60 bg-white p-4 shadow-sm">
      <div className="relative">
        <Chip className="absolute left-3 top-3 z-10">Dubai Bestseller</Chip>

        {/* Wishlist / quick-add — hidden until hover or keyboard focus,
            then pop outward into place (per the design brief: "out from
            in"). Pointer-events are toggled with the animation so the
            invisible resting state isn't clickable. */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex origin-top-right scale-75 flex-col gap-2 opacity-0 transition-all duration-300 ease-luxury group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100">
          <WishlistButton
            product={product}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
          />
          {product.available && product.defaultVariant ? (
            <AddToCartButton
              variantId={product.defaultVariant.id}
              iconOnly
              className="h-9 w-9 rounded-full bg-white text-brown-900/70 shadow-sm ring-1 ring-black/5 hover:text-gold-700"
            />
          ) : (
            <button
              type="button"
              disabled
              aria-label="Out of stock"
              className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-white text-brown-900/30 shadow-sm ring-1 ring-black/5"
            >
              <BagIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link href={`/products/${product.handle}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-50">
            {product.image ? (
              <>
                <Image
                  src={getShopifyImageUrl(product.image.url, PRODUCT_IMAGE_WIDTH)}
                  alt={product.image.altText}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  className="object-contain transition-transform group-hover:scale-105"
                />
                {/* Soft reflection under the product — purely decorative,
                    mirrors the product photography treatment in the design
                    brief, no data involved. */}
                <div
                  className="pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-[50%] bg-brown-900/10 blur-md"
                  aria-hidden
                />
              </>
            ) : null}
          </div>
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 font-sans">
        {discountPercent !== null && discountPercent > 0 && (
          <span className="flex items-center gap-0.5 text-sm font-semibold text-[#008042]">
            <ArrowDownIcon className="h-3.5 w-3.5" />
            {discountPercent}%
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[18px] font-bold text-brown-900">
          <DirhamSymbol size="0.85em" />
          {product.price.amount.toLocaleString()}
        </span>
        {product.compareAtPrice && (
          <span className="flex items-center gap-0.5 text-base text-[#7A7369] line-through">
            <DirhamSymbol size="0.75em" />
            {product.compareAtPrice.amount.toLocaleString()}
          </span>
        )}
      </div>

      <Link href={`/products/${product.handle}`}>
        <h3 className="mt-2 line-clamp-1 font-sans text-[14px] text-brown-900">
          {product.title}
        </h3>
      </Link>

      <div className="mt-2 flex items-center gap-2 font-sans text-sm">
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-3.5 w-3.5 text-warning-500" />
          ))}
          <span className="ml-1 font-normal text-brown-900/40">(6)</span>
        </span>
        <span className="ml-auto rounded-full bg-gradient-to-r from-[#D6A33F] to-[#78591F] px-3 py-1 text-xs font-medium text-white">
          1-3 Day Delivery
        </span>
      </div>
    </div>
  );
}
