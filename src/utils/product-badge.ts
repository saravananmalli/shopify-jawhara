/**
 * Custom badge: any Shopify product tag written as `badge:<Label>`
 * (e.g. `badge:Eid Special`) shows "<Label>" — new badges need no code change.
 */
const BADGE_TAG_PREFIX = /^badge:\s*(.+)$/i;

/**
 * Plain tags that are badges by themselves. Matching ignores case and
 * treats hyphens/underscores as spaces, so "Limited Edition",
 * "limited-edition" and "limited_edition" are the same tag. The badge shows
 * the tag as typed, unless a fixed label is set in BADGE_LABEL_OVERRIDES.
 */
const PLAIN_BADGE_TAGS = new Set([
  "new arrival",
  "limited edition",
  "gift pick",
  "trending",
  "exclusive",
]);

const BADGE_LABEL_OVERRIDES: Record<string, string> = {
  bestseller: "Dubai Bestseller",
  "flagship exclusive": "Dubai Flagship Exclusive",
};

const normalizeTag = (tag: string) => tag.toLowerCase().replace(/[-_]+/g, " ").trim();

/**
 * The first matching tag wins, in the order Shopify returns them. Returns
 * null when the product has no badge tag — nothing is shown, never a default.
 */
export function getProductBadge(tags: string[]): string | null {
  for (const tag of tags) {
    const custom = tag.match(BADGE_TAG_PREFIX)?.[1].trim();
    if (custom) return custom;

    const key = normalizeTag(tag);
    const override = BADGE_LABEL_OVERRIDES[key];
    if (override) return override;
    if (PLAIN_BADGE_TAGS.has(key)) return tag.replace(/[-_]+/g, " ").trim();
  }
  return null;
}
