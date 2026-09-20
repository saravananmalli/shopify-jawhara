import { DirectionsIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { toDirectionsHref, toTelHref } from "@/utils/stores";
import type { StoreLocation } from "@/types/content";

export default function StoreCard({
  store,
  distanceKm,
  nearest,
}: {
  store: StoreLocation;
  /** Null until the visitor's position is known (or the store has none). */
  distanceKm: number | null;
  nearest: boolean;
}) {
  const telHref = toTelHref(store.phone);
  const directionsHref = toDirectionsHref(store);

  return (
    <article className="relative flex flex-col gap-1 rounded-2xl border border-gold-100 bg-white p-6 transition duration-300 ease-luxury hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg">
      {nearest && (
        <span className="absolute right-4 top-4 rounded-full bg-gold-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          Nearest to you
        </span>
      )}

      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-gold-600">
        <MapPinIcon className="h-5 w-5" />
      </div>

      <h2 className="font-sans text-base font-semibold text-brown-900">{store.name}</h2>
      {store.address && (
        <p className="text-sm leading-relaxed text-brown-900/70">{store.address}</p>
      )}
      {distanceKm !== null && (
        <p className="mt-0.5 text-sm font-semibold text-gold-700">
          {distanceKm.toFixed(1)} km away
        </p>
      )}
      {store.hours && (
        <p className="mt-0.5 whitespace-pre-line text-sm text-brown-900/60">{store.hours}</p>
      )}

      {(telHref || directionsHref) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {telHref && (
            <a
              href={telHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cream-100 px-3 py-1.5 text-sm font-medium text-brown-900 transition-colors duration-300 ease-luxury hover:bg-gold-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              <PhoneIcon className="h-4 w-4" />
              {store.phone}
            </a>
          )}
          {directionsHref && (
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Directions to ${store.name} (opens in a new tab)`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 ease-luxury hover:bg-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              <DirectionsIcon className="h-4 w-4" />
              Directions
            </a>
          )}
        </div>
      )}
    </article>
  );
}
