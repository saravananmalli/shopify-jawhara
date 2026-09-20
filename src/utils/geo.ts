export type Coordinates = { lat: number; lng: number };

/** Great-circle (haversine) distance between two points, in kilometres. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Null unless both values are numbers inside the valid lat/lng ranges —
 * Admin-typed text can be blank, swapped or out of range. */
export function parseCoordinates(
  lat: string | null | undefined,
  lng: string | null | undefined,
): Coordinates | null {
  if (!lat?.trim() || !lng?.trim()) return null;
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;
  if (Math.abs(parsedLat) > 90 || Math.abs(parsedLng) > 180) return null;
  return { lat: parsedLat, lng: parsedLng };
}
