import { DirhamSymbol } from "dirham/react";

/**
 * Shopify's menu editor can't render the new UAE Dirham sign (U+20C3) as
 * plain text, so price-shaped fragments in menu titles ("AED 1,000",
 * "Under 1000", "1000 to 2500") are matched here and swapped for the
 * `dirham` package's SVG symbol at render time — Shopify keeps storing
 * plain numbers, the frontend supplies the symbol.
 *
 * A number is only treated as a price when something else in the title
 * gives it context (a word, or an explicit "AED"); a title that's nothing
 * but a bare number (e.g. a collection literally named "365") is left
 * untouched. A number glued directly to a letter ("18K") is never matched,
 * so product specs aren't mistaken for prices.
 */
const PRICE_TOKEN = /(?:AED\s*)?(\d[\d,]*(?:\.\d+)?)(?![A-Za-z%\d])/gi;
const BARE_NUMBER = /^\d[\d,]*(?:\.\d+)?$/;

export default function DirhamText({ text }: { text: string }) {
  if (BARE_NUMBER.test(text.trim())) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(PRICE_TOKEN)) {
    const [fullMatch, number] = match;
    const index = match.index;
    if (text.slice(lastIndex, index)) {
      nodes.push(text.slice(lastIndex, index));
    }
    nodes.push(
      <span key={key++} className="inline-flex items-center gap-0.5 whitespace-nowrap">
        <DirhamSymbol size="1em" />
        {number}
      </span>
    );
    lastIndex = index + fullMatch.length;
  }

  if (nodes.length === 0) return <>{text}</>;
  nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}
