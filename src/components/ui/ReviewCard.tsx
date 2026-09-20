"use client";

import Image from "next/image";
import Link from "@/components/ui/Link";
import RatingStars from "@/components/ui/RatingStars";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { INTL_LOCALE } from "@/utils/format";
import type { Locale } from "@/config/i18n";
import { getShopifyImageUrl } from "@/utils/shopify-image";
import type { Review } from "@/types/review";

function formatReviewDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * One approved review. Every card has a badge, but "Verified Purchase" is used
 * only when Judge.me has verified the buyer — never hardcode it for other
 * reviews (misleading to shoppers); they get the neutral "Customer Review". Pass a review with `product` to add the link back to
 * the reviewed product (homepage); the product page omits it.
 */
export default function ReviewCard({
  review,
  className = "",
}: {
  review: Review;
  /** Layout classes for the card (e.g. a fixed width inside a carousel). */
  className?: string;
}) {
  const locale = useLocale();
  const { common, product: t } = useDictionary();
  const { product } = review;

  return (
    <li
      className={`flex flex-col gap-3 rounded-xl border-[1.5px] border-dashed border-review-border bg-white p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-review-avatar text-2xl font-bold text-brown-900"
        >
          {review.reviewerName.charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
          <p className="text-base font-bold text-brown-900">{review.reviewerName}</p>
          <span
            className={`inline-block w-max whitespace-nowrap rounded-sm px-2 py-[3px] text-[11px] font-semibold text-brown-900 ${
              review.verifiedPurchase ? "bg-review-verified" : "bg-cream-100"
            }`}
          >
            {review.verifiedPurchase
              ? t.reviewsSection.verifiedPurchase
              : t.reviewsSection.customerReview}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RatingStars rating={review.rating} />
        <span className="text-base font-bold text-brown-900">{review.rating}</span>
        <span className="sr-only">{formatMessage(common.ratedOutOf5, { rating: review.rating })}</span>
      </div>

      {review.title && (
        <p dir="auto" className="text-sm font-semibold text-brown-900">
          {review.title}
        </p>
      )}
      {review.body && (
        <p dir="auto" className="text-sm leading-[1.75] text-brown-900">
          {review.body}
        </p>
      )}
      <p className="text-xs italic text-review-muted">
        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt, locale)}</time>
      </p>

      {product && (
        <Link
          href={`/products/${product.handle}`}
          className="group mt-auto flex items-center gap-3 border-t-[1.5px] border-dashed border-review-border pt-3"
        >
          {product.image && (
            <Image
              src={getShopifyImageUrl(product.image.url, 120)}
              alt={product.image.altText}
              width={60}
              height={60}
              sizes="60px"
              className="size-[60px] shrink-0 rounded-sm bg-cream-50 object-cover"
            />
          )}
          <span className="text-[11px] leading-normal text-review-muted transition-colors group-hover:text-gold-600">
            {product.title}
          </span>
        </Link>
      )}
    </li>
  );
}
