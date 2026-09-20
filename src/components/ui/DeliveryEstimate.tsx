"use client";

import { useDeliveryEstimate, useLocationUi } from "@/store/delivery";
import { useDictionary } from "@/store/locale";
import { MapPinIcon } from "@/components/icons";

/** Product-page delivery promise for the shopper's emirate, with a way to change it. */
export default function DeliveryEstimate({ available }: { available: boolean }) {
  const estimate = useDeliveryEstimate(available);
  const { openPicker } = useLocationUi();
  const { delivery } = useDictionary();

  if (!estimate) return null;

  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl bg-white px-4 py-3 font-sans">
      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brown-900">{estimate.label}</p>
        {estimate.detail && <p className="text-xs text-brown-900/60">{estimate.detail}</p>}
      </div>
      <button
        type="button"
        onClick={openPicker}
        className="shrink-0 text-xs text-gold-700 underline underline-offset-2 hover:text-gold-600"
      >
        {delivery.changeLocation}
      </button>
    </div>
  );
}
