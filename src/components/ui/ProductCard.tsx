"use client";

import { memo, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { DirhamSymbol } from "dirham/react";
import AddToCartButton from "@/components/ui/AddToCartButton";
import WishlistButton from "@/components/ui/WishlistButton";
import Chip from "@/components/ui/Chip";
import RatingStars from "@/components/ui/RatingStars";
import { ArrowDownIcon, BagIcon } from "@/components/icons";
import { useDeliveryEstimate } from "@/store/delivery";
import { useDictionary, useLocale } from "@/store/locale";
import { formatNumber } from "@/utils/format";
import { formatMessage, pluralize } from "@/utils/i18n";
import { getProductBadge } from "@/utils/product-badge";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { Product } from "@/types/product";

// 2x the largest rendered width (25vw of the 1440px max-w-8xl container).
const PRODUCT_IMAGE_WIDTH = 800;

// Memoised: listing pages re-render their whole grid on every filter-drawer
// toggle or pending state, but a card's `product` object is stable.
export default memo(function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.price.amount / product.compareAtPrice.amount) * 100)
    : null;

  const locale = useLocale();
  const { common, product: t } = useDictionary();
  const badge = getProductBadge(product.tags, t.badges);
  const delivery = useDeliveryEstimate(product.available);

  // The photo after the featured one (typically a model / alternate shot).
  const secondaryImage =
    product.images.find((image) => image.url !== product.image?.url) ?? null;
  // Fetched on the first mouse hover, not up front: a listing page would
  // otherwise download a second photo for every card nobody hovers.
  const [secondaryRequested, setSecondaryRequested] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const requestSecondary = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setSecondaryRequested(true);
  };

  return (
    <div
      className="group relative flex flex-col rounded-3xl border border-[#E6D7BE]/60 bg-white p-3.5 shadow-sm"
      onPointerEnter={requestSecondary}
    >
      <div className="relative">
        {badge && <Chip className="absolute start-3 top-3 z-10">{badge}</Chip>}

        {/* Wishlist / quick-add — hidden until hover or keyboard focus,
            then pop outward into place (per the design brief: "out from
            in"). Pointer-events are toggled with the animation so the
            invisible resting state isn't clickable. */}
        <div className="pointer-events-none absolute end-3 top-3 z-10 flex origin-top-right rtl:origin-top-left scale-75 flex-col gap-2 opacity-0 transition-all duration-300 ease-luxury group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100">
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
              aria-label={common.outOfStock}
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
                  className={`object-contain transition-[opacity,transform] duration-(--motion-slow) ease-luxury ${
                    secondaryLoaded
                      ? "group-hover:opacity-0 group-focus-within:opacity-0"
                      : "group-hover:scale-105"
                  }`}
                />
                {secondaryImage && secondaryRequested && (
                  <Image
                    src={getShopifyImageUrl(secondaryImage.url, PRODUCT_IMAGE_WIDTH)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    onLoad={() => setSecondaryLoaded(true)}
                    className={`object-contain transition-opacity duration-(--motion-slow) ease-luxury ${
                      secondaryLoaded
                        ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                        : "opacity-0"
                    }`}
                  />
                )}
                {/* Soft reflection under the product — purely decorative,
                    mirrors the product photography treatment in the design
                    brief, no data involved. */}
                <div
                  className={`pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-[50%] bg-brown-900/10 blur-md transition-opacity duration-(--motion-slow) ${
                    secondaryLoaded ? "group-hover:opacity-0" : ""
                  }`}
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
        <span className="flex items-center gap-0.5 text-[18px] font-bold text-brown-900 rtl:flex-row-reverse">
          <DirhamSymbol size="0.85em" />
          {formatNumber(product.price.amount, locale)}
        </span>
        {product.compareAtPrice && (
          <span className="flex items-center gap-0.5 text-base text-[#7A7369] line-through rtl:flex-row-reverse">
            <DirhamSymbol size="0.75em" />
            {formatNumber(product.compareAtPrice.amount, locale)}
          </span>
        )}
      </div>

      <Link href={`/products/${product.handle}`}>
        <h3 dir="auto" className="mt-2 line-clamp-1 font-sans text-[14px] text-brown-900">
          {product.title}
        </h3>
      </Link>

      <div className="mt-2 flex items-center gap-2 font-sans text-sm">
        {product.rating && (
          <span className="flex items-center gap-1">
            <RatingStars rating={product.rating.average} size="md" />
            <span className="font-normal text-brown-900/40">({product.rating.count})</span>
            <span className="sr-only">
              {formatMessage(t.ratedFromReviews, {
                rating: product.rating.average,
                reviews: pluralize(locale, product.rating.count, t.reviewsCount),
              })}
            </span>
          </span>
        )}
        {delivery && (
          <span className="ms-auto rounded-full bg-gradient-to-r from-[#D6A33F] to-[#78591F] px-3 py-1 text-xs font-medium text-white">
            {delivery.label}
          </span>
        )}
      </div>
    </div>
  );
});
