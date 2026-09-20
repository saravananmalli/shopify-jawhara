import RatingStars from "@/components/ui/RatingStars";
import ReviewCard from "@/components/ui/ReviewCard";
import { getDictionary } from "@/dictionaries";
import { getProductReviews } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";
import { formatMessage, pluralize } from "@/utils/i18n";
import type { RatingSummary, Review } from "@/types/review";

const VISIBLE_REVIEWS = 6;
const STARS = [5, 4, 3, 2, 1] as const;

function ReviewGrid({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </ul>
  );
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      id="customer-reviews"
      aria-labelledby="customer-reviews-heading"
      className="scroll-mt-48 border-t border-review-track"
    >
      <div className="mx-auto max-w-8xl px-4 py-10">
        <h2
          id="customer-reviews-heading"
          className="mb-6 font-heading-serif text-xl font-bold text-gold-600 md:text-2xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/**
 * Only reviews approved in Judge.me are shown. Rendered only for products
 * with a published review (the page passes the Shopify rating summary).
 */
export default async function ProductReviews({
  productId,
  summary,
}: {
  productId: string;
  summary: RatingSummary;
}) {
  const locale = await getLocale();
  const { product: t } = await getDictionary(locale);
  const { reviews, distribution } = await getProductReviews(productId, summary);
  const average = Number.isInteger(summary.average)
    ? String(summary.average)
    : summary.average.toFixed(1);
  const total = reviews?.length ?? 0;

  return (
    <Frame title={t.reviewsSection.title}>
      <div className="mb-8 grid grid-cols-1 gap-5 rounded-xl border border-gold-100 bg-white p-5 md:grid-cols-[160px_1fr] md:gap-10 md:px-8 md:py-6">
        <div className="flex flex-row flex-wrap items-center justify-start gap-2 border-b border-review-track pb-5 md:flex-col md:justify-center md:border-b-0 md:border-e md:pb-0 md:pe-10">
          <span className="font-heading-serif text-[56px] font-bold leading-none text-brown-900">
            {average}
          </span>
          <RatingStars rating={summary.average} />
          <span className="text-[11px] text-review-faint md:text-center">
            {formatMessage(t.reviewsSection.basedOn, {
              reviews: pluralize(locale, summary.count, t.reviewsCount),
            })}
          </span>
          <span className="sr-only">
            {formatMessage(t.reviewsSection.averageRating, { average })}
          </span>
        </div>

        {distribution && total > 0 && (
          <ul className="flex flex-col justify-center gap-2">
            {STARS.map((star) => {
              const percent = Math.round((distribution[star] / total) * 100);
              return (
                <li key={star} className="grid grid-cols-[64px_1fr_38px] items-center gap-3">
                  <span className="whitespace-nowrap text-end text-[11px] text-review-muted">
                    {pluralize(locale, star, t.reviewsSection.starLabel)}
                  </span>
                  <span aria-hidden className="h-2 overflow-hidden rounded-full bg-review-track">
                    <span
                      className="block h-full rounded-full bg-linear-to-r rtl:bg-linear-to-l from-review-star to-review-star-deep"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="text-[11px] text-review-faint">{percent}%</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <>
          <ReviewGrid reviews={reviews.slice(0, VISIBLE_REVIEWS)} />
          {reviews.length > VISIBLE_REVIEWS && (
            <details className="group mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-gold-700 marker:content-none group-open:hidden">
                {formatMessage(t.reviewsSection.showAll, { count: reviews.length })}
              </summary>
              <ReviewGrid reviews={reviews.slice(VISIBLE_REVIEWS)} />
            </details>
          )}
        </>
      )}
    </Frame>
  );
}

export function ProductReviewsSkeleton({ title, label }: { title: string; label: string }) {
  return (
    <Frame title={title}>
      <div role="status" aria-busy="true">
        <span className="sr-only">{label}</span>
        <div className="h-40 animate-pulse rounded-xl bg-cream-100" />
      </div>
    </Frame>
  );
}
