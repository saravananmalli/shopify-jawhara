export type Emirate = {
  name: string;
  lat: number;
  lng: number;
};

export const UAE_EMIRATES: Emirate[] = [
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  { name: "Sharjah", lat: 25.3463, lng: 55.4209 },
  { name: "Ajman", lat: 25.4052, lng: 55.5136 },
  { name: "Ras Al Khaimah", lat: 25.7895, lng: 55.9432 },
  { name: "Fujairah", lat: 25.1288, lng: 56.3265 },
  { name: "Umm Al Quwain", lat: 25.5647, lng: 55.5534 },
  { name: "Al Ain", lat: 24.2075, lng: 55.7447 },
];

function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
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

export function nearestEmirate(coords: { lat: number; lng: number }): Emirate {
  return UAE_EMIRATES.reduce((closest, emirate) =>
    haversineDistanceKm(coords, emirate) < haversineDistanceKm(coords, closest)
      ? emirate
      : closest
  );
}

/** Beyond this from every emirate's centre the shopper is outside the UAE (or
 * in the desert), so a nearest-emirate guess would promise the wrong delivery. */
const MAX_MATCH_DISTANCE_KM = 250;

export function emirateFromCoords(coords: { lat: number; lng: number }): Emirate | null {
  const nearest = nearestEmirate(coords);
  return haversineDistanceKm(coords, nearest) <= MAX_MATCH_DISTANCE_KM ? nearest : null;
}

export function isEmirateName(value: unknown): value is string {
  return typeof value === "string" && UAE_EMIRATES.some((e) => e.name === value);
}
