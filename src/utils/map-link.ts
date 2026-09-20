import type { Coordinates } from "@/utils/geo";

/**
 * Coordinates embedded in a full Google Maps URL. Tries the most precise
 * pattern first: the place pin (`!3d…!4d…`) over the map-view centre
 * (`@lat,lng`, which can be tens of km from the pin) over a `?q=lat,lng` query.
 */
export function extractCoordinatesFromMapUrl(url: string): Coordinates | null {
  const pin = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pin) return { lat: Number(pin[1]), lng: Number(pin[2]) };

  const center = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (center) return { lat: Number(center[1]), lng: Number(center[2]) };

  const query = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (query) return { lat: Number(query[1]), lng: Number(query[2]) };

  return null;
}

/** Shortened share links (maps.app.goo.gl, goo.gl/maps) carry no coordinates
 * themselves; only these hosts are ever followed. */
export function isShortMapLinkHost(hostname: string): boolean {
  return /(^|\.)goo\.gl$/.test(hostname);
}
