import { StarIcon } from "@/components/icons";
import type { Testimonial } from "@/types/content";

function Stars({ rating, className }: { rating: number; className: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${className} ${i < rating ? "text-gold-600" : "text-gold-100"}`}
        />
      ))}
    </div>
  );
}

/** Renders nothing when there are no active testimonials in Shopify. */
export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  const average =
    testimonials.reduce((sum, review) => sum + review.rating, 0) / testimonials.length;

  return (
    <section className="mx-auto max-w-8xl px-4 py-14 text-center">
      <div className="mb-2 flex justify-center">
        <Stars rating={Math.round(average)} className="h-4 w-4" />
      </div>
      <p className="text-lg font-semibold">
        {average.toFixed(1)} / 5.0
        <span className="sr-only"> average from {testimonials.length} client reviews</span>
      </p>
      <h2 className="mt-2 font-serif text-3xl text-gold-600">Words from Our Clients</h2>

      <ul className="mt-8 grid grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((review) => (
          <li key={review.id} className="rounded-2xl border border-gold-100 bg-white p-5">
            <Stars rating={review.rating} className="h-3.5 w-3.5" />
            <span className="sr-only">Rated {review.rating} out of 5</span>
            <blockquote className="mt-3 text-sm leading-relaxed text-brown-900/80">
              &ldquo;{review.quote}&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center gap-3 border-t border-gold-100 pt-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700"
              >
                {review.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{review.customerName}</p>
                {review.detail && <p className="text-xs text-brown-900/50">{review.detail}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
