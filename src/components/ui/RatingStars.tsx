import { StarIcon } from "@/components/icons";

const SIZES = {
  md: "size-3.5",
  lg: "size-[18px]",
} as const;

function Star({ fill, size }: { fill: 0 | 0.5 | 1; size: string }) {
  return (
    <span className={`relative inline-block text-review-star ${size}`}>
      <StarIcon filled={false} className={`absolute inset-0 ${size}`} />
      {fill > 0 && (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <StarIcon className={`max-w-none ${size}`} />
        </span>
      )}
    </span>
  );
}

/** Full, half and outlined stars for a 0–5 rating. Decorative: pair with text. */
export default function RatingStars({
  rating,
  size = "lg",
}: {
  rating: number;
  size?: keyof typeof SIZES;
}) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          fill={rating >= i + 1 ? 1 : rating >= i + 0.5 ? 0.5 : 0}
          size={SIZES[size]}
        />
      ))}
    </div>
  );
}
