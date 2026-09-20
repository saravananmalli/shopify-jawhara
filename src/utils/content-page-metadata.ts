import type { Metadata } from "next";
import type { ContentPage } from "@/types/content";

const DESCRIPTION_LENGTH = 160;

/** Plain-text summary of merchant HTML, for a meta description when Admin has none. */
function summarize(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > DESCRIPTION_LENGTH ? `${text.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…` : text;
}

/** Title, description, canonical/hreflang and social tags for a Shopify page or policy. */
export function pageMetadata(
  page: ContentPage,
  brand: string,
  url: string,
  alternates: NonNullable<Metadata["alternates"]>,
): Metadata {
  const title = `${page.seoTitle ?? page.title} | ${brand}`;
  const description = page.seoDescription ?? (summarize(page.bodyHtml) || undefined);

  return {
    title,
    description,
    alternates,
    openGraph: { title, description, type: "website", url },
    twitter: { card: "summary_large_image", title, description },
  };
}
