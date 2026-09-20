/**
 * Serialises structured data for an inline <script type="application/ld+json">.
 * JSON.stringify alone doesn't escape "<", so a product title or description
 * containing "</script><script>…" would break out of the tag. Escaping "<"
 * (and the line separators that break older JS parsers) keeps the JSON
 * identical for crawlers while making breakout impossible.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}
