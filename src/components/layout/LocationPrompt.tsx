"use client";

import { useRoutePath } from "@/hooks/useRoutePath";
import { useLocationUi } from "@/store/delivery";
import { useDictionary } from "@/store/locale";
import { CloseIcon, MapPinIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";

/**
 * In-page fallback for the browser's location popup, which shoppers often
 * dismiss without answering. Only appears after that first popup, and only
 * while permission is still undecided — once denied it can't help, and the
 * header's "Select location" covers manual choice.
 */
export default function LocationPrompt() {
  const { promptVisible, locating, allowLocation, dismissPrompt, openPicker } = useLocationUi();
  const { delivery: t, common } = useDictionary();
  // The product page's purchase bar never hides, so the prompt must stay above it.
  const aboveFixedBar = useRoutePath().startsWith("/products/");

  if (!promptVisible) return null;

  return (
    <aside
      aria-label={t.locationLabel}
      className={`fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex items-start gap-3 rounded-2xl border border-gold-100 bg-white p-4 font-sans shadow-xl transition-[bottom] duration-300 ease-luxury sm:inset-x-auto sm:start-4 sm:max-w-sm ${
        aboveFixedBar ? "" : "[html[data-nav-hidden=true]_&]:bottom-4"
      }`}
    >
      <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brown-900">{t.promptTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-brown-900/70">
          {t.promptBody}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={allowLocation}
            disabled={locating}
            className="min-h-10 px-4 py-2 text-xs font-medium"
          >
            {locating ? t.locating : t.allowLocation}
          </Button>
          <button
            type="button"
            onClick={openPicker}
            className="flex min-h-10 items-center text-xs text-gold-700 underline underline-offset-2 hover:text-gold-600"
          >
            {t.chooseManually}
          </button>
        </div>
      </div>
      <IconButton
        icon={<CloseIcon className="h-4 w-4" />}
        aria-label={common.dismiss}
        onClick={dismissPrompt}
        className="-me-2 -mt-2 shrink-0 text-brown-900/50"
      />
    </aside>
  );
}
