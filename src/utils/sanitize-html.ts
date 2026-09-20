import sanitizeHtml from "sanitize-html";

/**
 * Cleans merchant HTML from a Shopify page or policy before it is rendered
 * with dangerouslySetInnerHTML. It is authored by staff in Admin, but a
 * compromised staff account or a pasted snippet must not become stored XSS on
 * the storefront, so this is an allowlist: layout/text tags only, no scripts,
 * styles, forms or iframes, and links/images restricted to safe schemes.
 *
 * Server-only (sanitize-html adds nothing to the client bundle).
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "blockquote", "div", "span",
      "ul", "ol", "li",
      "strong", "b", "em", "i", "u", "s", "sup", "sub",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    // Site-relative links (/pages/faq) and anchors are fine; they carry no scheme.
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:/i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external && { target: "_blank", rel: "noopener noreferrer" }),
          },
        };
      },
      // Below-the-fold rich-text images: lazy, async decode.
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy", decoding: "async" },
      }),
    },
  });
}
