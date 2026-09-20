import ReviewCard from "@/components/ui/ReviewCard";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import type { Review } from "@/types/review";

/** Renders nothing when there are no approved Judge.me reviews. */
export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="home-reviews-heading" className="bg-cream-200">
      <div className="mx-auto max-w-8xl px-4 py-12">
        <div className="mb-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
            Loved by Clients
          </p>
          <h2 id="home-reviews-heading" className="mt-1 font-sans text-3xl font-normal">
            What Our Customers Say
          </h2>
          <p className="mt-1 font-sans text-sm text-brown-900/60">
            Honest words from those who chose Jawhara for their most treasured moments.
          </p>
        </div>
        <ReviewCarousel itemCount={reviews.length}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              className="w-full shrink-0 snap-start md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            />
          ))}
        </ReviewCarousel>
      </div>
    </section>
  );
}
