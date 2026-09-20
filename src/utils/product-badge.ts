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

/** Tags whose label is fixed rather than the tag text. */
const BADGE_LABEL_OVERRIDES = new Set(["bestseller", "flagship exclusive"]);

const normalizeTag = (tag: string) => tag.toLowerCase().replace(/[-_]+/g, " ").trim();

/**
 * The first matching tag wins, in the order Shopify returns them. Returns
 * null when the product has no badge tag — nothing is shown, never a default.
 *
 * `labels` are the translated names of the well-known tags. Product tags
 * aren't translatable in Shopify, so a custom `badge:<Label>` tag is shown
 * exactly as typed in every language.
 */
export function getProductBadge(
  tags: string[],
  labels: Record<string, string>
): string | null {
  for (const tag of tags) {
    const custom = tag.match(BADGE_TAG_PREFIX)?.[1].trim();
    if (custom) return custom;

    const key = normalizeTag(tag);
    if (BADGE_LABEL_OVERRIDES.has(key) || PLAIN_BADGE_TAGS.has(key)) {
      return labels[key] ?? tag.replace(/[-_]+/g, " ").trim();
    }
  }
  return null;
}
