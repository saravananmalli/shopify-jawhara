import type { Coordinates } from "@/utils/geo";
import {
  extractCoordinatesFromMapUrl,
  isShortMapLinkHost,
} from "@/utils/map-link";

const MAX_REDIRECT_HOPS = 3;
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Coordinates for a Google Maps link pasted into Shopify Admin. Server-only —
 * it runs while a page is (re)generated, never in the browser.
 *
 * A short link answers with a 302 whose Location holds the full URL (and the
 * pin), so we read that header instead of downloading the Maps page. Redirects
 * are followed by hand so only goo.gl hosts are ever requested: the link is
 * Admin-edited text and must not be able to point the server at another host.
 * Returns null (store still lists, just without a distance) on any failure.
 */
export async function resolveMapLinkCoordinates(
  link: string | null | undefined,
): Promise<Coordinates | null> {
  let url: URL;
  try {
    url = new URL((link ?? "").trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
    const coordinates = extractCoordinatesFromMapUrl(url.toString());
    if (coordinates) return coordinates;
    if (!isShortMapLinkHost(url.hostname)) return null;

    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      void response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) return null;
      url = new URL(location, url);
      if (url.protocol !== "https:") return null;
    } catch {
      return null;
    }
  }

  return null;
}
