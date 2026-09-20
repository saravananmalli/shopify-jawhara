/** The reviewed product, from Shopify — only set where a card links back to it. */
export type ReviewProduct = {
  handle: string;
  title: string;
  image: { url: string; altText: string } | null;
};

export type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  /** True only when Judge.me marks the review as from a verified buyer. */
  verifiedPurchase: boolean;
  /** ISO date string. */
  createdAt: string;
  product?: ReviewProduct | null;
};

export type RatingSummary = {
  average: number;
  count: number;
};

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type ProductReviews = {
  summary: RatingSummary;
  /** Null when the individual reviews couldn't be loaded. */
  reviews: Review[] | null;
  /** Review counts per star, computed from `reviews`. */
  distribution: RatingDistribution | null;
};
