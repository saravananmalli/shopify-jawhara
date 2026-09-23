"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import DialogOverlay from "@/components/ui/DialogOverlay";
import IconButton from "@/components/ui/IconButton";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { DetectResult } from "@/store/delivery";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { UAE_EMIRATES } from "@/utils/emirates";
import {
  CheckIcon,
  CloseIcon,
  CrosshairIcon,
  MapPinIcon,
  SearchIcon,
} from "@/components/icons";

type GeoStatus = "idle" | "locating" | "error" | "outside";

export default function LocationModal({
  open,
  onClose,
  selected,
  onSelect,
  onDetect,
}: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  onSelect: (city: string) => void;
  onDetect: () => Promise<DetectResult>;
}) {
  const { delivery: t, common } = useDictionary();
  const emirateName = (name: string) => (t.emirates as Record<string, string>)[name] ?? name;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  useFocusTrap(dialogRef, open, onClose);

  // Match on the name the shopper sees (Arabic or English) and the English key.
  const term = search.trim().toLowerCase();
  const filtered = UAE_EMIRATES.filter(
    (e) =>
      e.name.toLowerCase().includes(term) || emirateName(e.name).toLowerCase().includes(term)
  );

  async function useCurrentLocation() {
    setGeoStatus("locating");
    const result = await onDetect();
    if (result === "ok") {
      setGeoStatus("idle");
      onClose();
    } else {
      setGeoStatus(result);
    }
  }

  return (
    <DialogOverlay
      visible={open}
      onClose={onClose}
      scrimClassName="bg-black/50"
      className="flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.locationLabel}
        className={`relative flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-300 ease-luxury ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-gold-700 via-gold-600 to-gold-700 px-5 py-4 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            <MapPinIcon className="h-5 w-5" />
            {t.modalTitle}
          </h2>
          <IconButton
            icon={<CloseIcon className="h-5 w-5" />}
            aria-label={common.close}
            onClick={onClose}
            hoverTone="white"
            className="-me-2"
          />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <Button
            variant="neutral-filled"
            onClick={useCurrentLocation}
            disabled={geoStatus === "locating"}
            icon={<CrosshairIcon className="h-4 w-4" />}
            className="px-4 py-3 text-sm font-medium"
          >
            {geoStatus === "locating" ? t.locating : t.useMyLocation}
          </Button>
          {geoStatus === "error" && (
            <p role="alert" className="-mt-2 text-xs text-error-700">
              {t.geoError}
            </p>
          )}

          {geoStatus === "outside" && (
            <p role="alert" className="-mt-2 text-xs text-error-700">
              {t.geoOutside}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-brown-900/40">
            <span className="h-px flex-1 bg-gold-100" />
            {t.orChooseCity}
            <span className="h-px flex-1 bg-gold-100" />
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gold-100 px-4 py-2.5">
            <SearchIcon className="h-4 w-4 text-gold-700" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchCities}
              aria-label={t.searchCitiesLabel}
              className="w-full text-sm outline-none placeholder:text-brown-900/40"
            />
          </div>

          <ul role="listbox" className="flex flex-col gap-1">
            {filtered.length === 0 ? (
              <li className="py-4 text-center text-sm text-brown-900/50">
                {formatMessage(t.noCities, { query: search })}
              </li>
            ) : (
              filtered.map((emirate) => {
                const isSelected = emirate.name === selected;
                return (
                  <li key={emirate.name}>
                    <button
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelect(emirate.name);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-start text-sm ${
                        isSelected
                          ? "bg-gold-50 font-semibold text-gold-700"
                          : "text-brown-900/80 hover:bg-cream-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        {emirateName(emirate.name)}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-brown-900/40">
                        {t.uae}
                        {isSelected && <CheckIcon className="h-4 w-4 text-gold-700" />}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </DialogOverlay>
  );
}
