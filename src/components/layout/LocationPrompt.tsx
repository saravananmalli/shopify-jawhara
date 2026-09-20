"use client";

import { useLocationUi } from "@/store/delivery";
import { useDictionary } from "@/store/locale";
import { CloseIcon, MapPinIcon } from "@/components/icons";

/**
 * In-page fallback for the browser's location popup, which shoppers often
 * dismiss without answering. Only appears after that first popup, and only
 * while permission is still undecided — once denied it can't help, and the
 * header's "Select location" covers manual choice.
 */
export default function LocationPrompt() {
  const { promptVisible, locating, allowLocation, dismissPrompt, openPicker } = useLocationUi();
  const { delivery: t, common } = useDictionary();

  if (!promptVisible) return null;

  return (
    <aside
      aria-label={t.locationLabel}
      className="fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex items-start gap-3 rounded-2xl border border-gold-100 bg-white p-4 font-sans shadow-xl sm:inset-x-auto sm:start-4 sm:max-w-sm"
    >
      <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brown-900">{t.promptTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-brown-900/70">
          {t.promptBody}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={allowLocation}
            disabled={locating}
            className="min-h-10 rounded-full bg-gold-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
          >
            {locating ? t.locating : t.allowLocation}
          </button>
          <button
            type="button"
            onClick={openPicker}
            className="flex min-h-10 items-center text-xs text-gold-700 underline underline-offset-2 hover:text-gold-600"
          >
            {t.chooseManually}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissPrompt}
        aria-label={common.dismiss}
        className="-me-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brown-900/50 hover:bg-cream-100"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </aside>
  );
}
