import { StarIcon } from "@/components/icons";

const REVIEWS = [
  {
    quote:
      "The armored delivery to our villa in Emirates Hills was flawlessly executed. The 2.2-carat GIA radiant cut solitaire has blinding fire, accompanied by Dubai Central Laboratory bareeq documentation.",
    name: "Mariam Al Mansoori",
    detail: "Emirates Hills, Dubai • GIA Solitaire Ring",
  },
  {
    quote:
      "Ordered the Riviera 22K Mangalsutra for our anniversary. The team accommodated a bespoke gold length adjustment within 24 hours at their Dubai Mall boutique. Remarkable concierge standard.",
    name: "Rajesh & Sunita K.",
    detail: "Saadiyat Island, Abu Dhabi • 22K Riviera Necklace",
  },
  {
    quote:
      "The Postcards video screen embedded in the champagne velvet presentation box took my wife's breath away. Maison Vendôme redefines genuine high luxury e-commerce in the Middle East.",
    name: "Tariq Al Hammadi",
    detail: "West Bay, Doha • Platinum Tennis Bracelet",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-8xl px-4 py-14 text-center">
      <div className="mb-2 flex items-center justify-center gap-1 text-gold-600">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </div>
      <p className="text-lg font-semibold">4.97 / 5.0</p>
      <h2 className="mt-2 font-serif text-3xl">Words from Our UAE Patrons</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-brown-900/60">
        Authenticated reviews from discerning collectors across Dubai, Abu Dhabi, and Doha.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
        {REVIEWS.map((review) => (
          <div key={review.name} className="rounded-2xl border border-gold-100 bg-white p-5">
            <div className="mb-3 flex gap-1 text-gold-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-3.5 w-3.5" />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-brown-900/80">
              &ldquo;{review.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-gold-100 pt-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700">
                {review.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-brown-900/50">{review.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
