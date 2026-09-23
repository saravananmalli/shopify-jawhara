import { DirectionsIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
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
  const { stores: t } = useDictionary();
  const telHref = toTelHref(store.phone);
  const directionsHref = toDirectionsHref(store);

  return (
    <article className="relative flex flex-col gap-1 rounded-2xl border border-gold-100 bg-white p-6 transition duration-300 ease-luxury hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg">
      {nearest && (
        <span className="absolute end-4 top-4 rounded-full bg-gold-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {t.nearest}
        </span>
      )}

      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-gold-600">
        <MapPinIcon className="h-5 w-5" />
      </div>

      <h2 dir="auto" className="font-sans text-base font-semibold text-brown-900">
        {store.name}
      </h2>
      {store.address && (
        <p dir="auto" className="text-sm leading-relaxed text-brown-900/70">
          {store.address}
        </p>
      )}
      {distanceKm !== null && (
        <p className="mt-0.5 text-sm font-semibold text-gold-700">
          {formatMessage(t.kmAway, { distance: distanceKm.toFixed(1) })}
        </p>
      )}
      {store.hours && (
        <p dir="auto" className="mt-0.5 whitespace-pre-line text-sm text-brown-900/60">
          {store.hours}
        </p>
      )}

      {(telHref || directionsHref) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {telHref && (
            <Button
              href={telHref}
              variant="neutral-filled"
              icon={<PhoneIcon className="h-4 w-4" />}
              className="gap-1.5 px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              {/* A phone number is left-to-right even inside Arabic text. */}
              <span dir="ltr">{store.phone}</span>
            </Button>
          )}
          {directionsHref && (
            <Button
              href={directionsHref}
              target="_blank"
              variant="primary"
              icon={<DirectionsIcon className="h-4 w-4" />}
              aria-label={formatMessage(t.directionsTo, { name: store.name })}
              className="gap-1.5 px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              {t.directions}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
