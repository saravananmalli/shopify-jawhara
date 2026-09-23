import ReviewCard from "@/components/ui/ReviewCard";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import type { Review } from "@/types/review";

/** Renders nothing when there are no approved Judge.me reviews. */
export default async function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const { home } = await getDictionary(await getLocale());
  const t = home.reviews;

  return (
    <section aria-labelledby="home-reviews-heading" className="bg-cream-200">
      <div className="page-container py-6 sm:py-12">
        <div className="mb-6">
          <SectionHeading id="home-reviews-heading" eyebrow={t.eyebrow} title={t.title} />
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
