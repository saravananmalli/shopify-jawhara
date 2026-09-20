import { shopifyConfig } from "@/config/shopify";
import { shopifyFetch } from "@/services/shopify/client";
import { REVIEW_PRODUCTS_QUERY } from "@/graphql/queries";
import type {
  ProductReviews,
  RatingDistribution,
  RatingSummary,
  Review,
} from "@/types/review";

const JUDGEME_REVIEWS_URL = "https://api.judge.me/api/v1/reviews";
const REVIEWS_REVALIDATE_SECONDS = 600;
const PER_PAGE = 100;
const MAX_PAGES = 5;

/** Judge.me review, only the fields we read. */
type JudgemeReview = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  curated?: string;
  hidden?: boolean;
  verified?: string;
  created_at: string;
  product_external_id?: number;
  reviewer?: { name?: string | null } | null;
};

function numericId(gid: string) {
  return gid.split("/").pop() ?? gid;
}

/**
 * Review text isn't exposed to the Storefront API, so it comes from Judge.me's
 * private API. That token must stay server-side (no NEXT_PUBLIC_ prefix). One
 * store-wide request is cached and shared by every caller (each product page
 * and the homepage), which then filter it.
 */
async function fetchPublishedReviews(): Promise<JudgemeReview[] | null> {
  const token = process.env.JUDGEME_PRIVATE_API_TOKEN;
  if (!token) return null;

  const collected: JudgemeReview[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const params = new URLSearchParams({
        api_token: token,
        // Judge.me registers the shop's permanent myshopify.com domain, which can
        // differ from the (renamed) one the Storefront API is configured with.
        shop_domain: process.env.JUDGEME_SHOP_DOMAIN ?? shopifyConfig.storeDomain,
        per_page: String(PER_PAGE),
        page: String(page),
      });
      const res = await fetch(`${JUDGEME_REVIEWS_URL}?${params}`, {
        next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error(`Judge.me request failed with status ${res.status}`);

      const json: { reviews?: JudgemeReview[] } = await res.json();
      const batch = json.reviews ?? [];
      collected.push(...batch);
      if (batch.length < PER_PAGE) break;
    }
  } catch (error) {
    // Message only — the request URL carries the token.
    console.error("Failed to load Judge.me reviews", (error as Error).message);
    return null;
  }

  // Fail closed: only reviews approved in Judge.me (curated "ok") and not
  // hidden are ever shown.
  return collected.filter((review) => review.curated === "ok" && !review.hidden);
}

function toReview(review: JudgemeReview): Review {
  return {
    id: String(review.id),
    rating: review.rating,
    title: review.title?.trim() ?? "",
    body: review.body?.trim() ?? "",
    reviewerName: review.reviewer?.name?.trim() || "Customer",
    verifiedPurchase: review.verified === "buyer",
    createdAt: review.created_at,
  };
}

const newestFirst = (a: Review, b: Review) => b.createdAt.localeCompare(a.createdAt);

export async function getProductReviews(
  productId: string,
  summary: RatingSummary,
): Promise<ProductReviews> {
  const published = await fetchPublishedReviews();
  const externalId = Number(numericId(productId));
  const reviews = published
    ?.filter((review) => review.product_external_id === externalId)
    .map(toReview)
    .sort(newestFirst);

  if (!reviews || reviews.length === 0) {
    return { summary, reviews: null, distribution: null };
  }

  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating))) as keyof RatingDistribution;
    distribution[star] += 1;
  }
  return { summary, reviews, distribution };
}

/**
 * Newest approved reviews across the store, each with its Shopify product
 * (title, image, link). Returns [] when Judge.me isn't configured or has no
 * published review, so the homepage section can hide itself.
 */
export async function getLatestReviews({ limit = 12 }: { limit?: number } = {}): Promise<Review[]> {
  const published = await fetchPublishedReviews();
  if (!published || published.length === 0) return [];

  const latest = published
    .map((review) => ({ review: toReview(review), productId: review.product_external_id }))
    .sort((a, b) => newestFirst(a.review, b.review))
    .slice(0, limit);

  const ids = [
    ...new Set(latest.flatMap(({ productId }) => (productId ? [`gid://shopify/Product/${productId}`] : []))),
  ];
  const data = ids.length
    ? await shopifyFetch<{
        nodes: ({
          id: string;
          handle: string;
          title: string;
          featuredImage: { url: string; altText: string | null } | null;
        } | null)[];
      }>({
        query: REVIEW_PRODUCTS_QUERY,
        variables: { ids },
        revalidate: REVIEWS_REVALIDATE_SECONDS,
      })
    : { nodes: [] };

  const products = new Map(
    data.nodes.flatMap((node) => (node ? [[numericId(node.id), node] as const] : [])),
  );

  return latest.map(({ review, productId }) => {
    const product = productId ? products.get(String(productId)) : undefined;
    return {
      ...review,
      product: product
        ? {
            handle: product.handle,
            title: product.title,
            image: product.featuredImage
              ? { url: product.featuredImage.url, altText: product.featuredImage.altText ?? product.title }
              : null,
          }
        : null,
    };
  });
}
