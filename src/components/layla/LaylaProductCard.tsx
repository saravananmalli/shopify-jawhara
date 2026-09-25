"use client";

import Image from "next/image";
import Link from "@/components/ui/Link";
import Chip from "@/components/ui/Chip";
import Price from "@/components/ui/Price";
import { ArrowDownIcon, ChevronRightIcon, StarIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/store/locale";
import { getDiscountPercent } from "@/utils/format";
import { formatMessage, pluralize } from "@/utils/i18n";
import { getProductBadge } from "@/utils/product-badge";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { ChatProduct } from "@/types/layla";

// 2x the 14rem card width.
const CARD_IMAGE_WIDTH = 450;

/** The storefront's product card as it appears on a phone — image tile, price
 * row, one-line title, one star and review count — plus a "View" row that leads
 * to the product. */
export default function LaylaProductCard({
  product,
  onNavigate,
}: {
  product: ChatProduct;
  onNavigate: () => void;
}) {
  const locale = useLocale();
  const { layla: t, product: p } = useDictionary();
  const discountPercent = getDiscountPercent(product.price, product.compareAtPrice);
  const badge = getProductBadge(product.tags, p.badges);

  return (
    <Link
      href={`/products/${product.handle}`}
      onClick={onNavigate}
      className="group relative flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E6D7BE]/60 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 ease-luxury hover:border-gold-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-50">
        {badge && (
          <Chip className="absolute start-2 top-2 z-10 max-w-[calc(100%-1rem)] text-center leading-tight">{badge}</Chip>
        )}
        {product.image && (
          <>
            <Image
              src={getShopifyImageUrl(product.image.url, CARD_IMAGE_WIDTH)}
              alt={product.image.altText || product.title}
              fill
              sizes="224px"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              // Same photo treatment as the storefront card on phones.
              className="translate-y-[20px] scale-120 object-contain transition-transform duration-500 ease-luxury group-hover:scale-125"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-[50%] bg-brown-900/10 blur-md"
            />
          </>
        )}
        {!product.available && (
          <span className="absolute end-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brown-900/70 rtl:tracking-normal">
            {t.outOfStock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-[2px]">
        <div className="mt-2.5 flex flex-nowrap items-center gap-x-2 whitespace-nowrap font-sans">
          {discountPercent !== null && (
            <span className="flex items-center gap-0.5 text-sm font-semibold text-[#008042]">
              <ArrowDownIcon className="h-3.5 w-3.5" />
              {discountPercent}%
            </span>
          )}
          <Price
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            size="0.85em"
            className="flex items-center gap-0.5 text-sm font-bold text-brown-900 rtl:flex-row-reverse"
          />
          {product.compareAtPrice && (
            <Price
              amount={product.compareAtPrice.amount}
              currencyCode={product.compareAtPrice.currencyCode}
              size="0.75em"
              className="flex items-center gap-0.5 text-sm text-[#7A7369] line-through rtl:flex-row-reverse"
            />
          )}
        </div>

        <h3 dir="auto" className="mb-2 mt-1.5 line-clamp-1 font-sans text-[13px] leading-snug text-brown-900">
          {product.title}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-cream-100 pt-2">
          {product.rating ? (
            <span className="flex items-center gap-1 font-sans text-sm">
              <span aria-hidden className="flex items-center gap-1">
                <StarIcon className="size-3.5 text-review-star" />
                <span className="font-normal text-brown-900/40">({product.rating.count})</span>
              </span>
              <span className="sr-only">
                {formatMessage(p.ratedFromReviews, {
                  rating: product.rating.average,
                  reviews: pluralize(locale, product.rating.count, p.reviewsCount),
                })}
              </span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600 group-hover:text-gold-700 rtl:tracking-normal">
            {t.viewProduct}
            <ChevronRightIcon className="h-3.5 w-3.5 transition-transform duration-300 ease-luxury group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
