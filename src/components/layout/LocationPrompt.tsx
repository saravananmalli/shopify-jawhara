"use client";

import { useLocationUi } from "@/store/delivery";
import { CloseIcon, MapPinIcon } from "@/components/icons";

/**
 * In-page fallback for the browser's location popup, which shoppers often
 * dismiss without answering. Only appears after that first popup, and only
 * while permission is still undecided — once denied it can't help, and the
 * header's "Select location" covers manual choice.
 */
export default function LocationPrompt() {
  const { promptVisible, locating, allowLocation, dismissPrompt, openPicker } = useLocationUi();

  if (!promptVisible) return null;

  return (
    <aside
      aria-label="Delivery location"
      className="fixed inset-x-4 bottom-4 z-40 flex items-start gap-3 rounded-2xl border border-gold-100 bg-white p-4 font-sans shadow-xl sm:inset-x-auto sm:left-4 sm:max-w-sm"
    >
      <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brown-900">See your delivery time</p>
        <p className="mt-1 text-xs leading-relaxed text-brown-900/70">
          Allow location access and we&apos;ll show whether your order can arrive today.
          It&apos;s only used to pick your emirate.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={allowLocation}
            disabled={locating}
            className="rounded-full bg-gold-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
          >
            {locating ? "Locating..." : "Allow location"}
          </button>
          <button
            type="button"
            onClick={openPicker}
            className="text-xs text-gold-700 underline underline-offset-2 hover:text-gold-600"
          >
            Choose manually
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissPrompt}
        aria-label="Dismiss"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brown-900/50 hover:bg-cream-100"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </aside>
  );
}
