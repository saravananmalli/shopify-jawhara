"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDictionary } from "@/store/locale";
import { getDeliveryEstimate, isPastSameDayCutoff } from "@/utils/delivery";
import { emirateFromCoords, isEmirateName } from "@/utils/emirates";

const EMIRATE_STORAGE_KEY = "jawhara_delivery_emirate";
const PROMPTED_STORAGE_KEY = "jawhara_location_prompted";
const BANNER_DISMISSED_STORAGE_KEY = "jawhara_location_banner_dismissed";

export type DetectResult = "ok" | "outside" | "error";

type DeliveryContextValue = {
  /** Null until the shopper picks one or allows location access. */
  emirate: string | null;
  setEmirate: (emirate: string) => void;
  pastCutoff: boolean;
};

type LocationUiContextValue = {
  open: boolean;
  openPicker: () => void;
  closePicker: () => void;
  /** Reads the browser's location and sets the matching emirate. */
  detectLocation: () => Promise<DetectResult>;
  /** In-page "allow location" prompt, for shoppers who missed the browser popup. */
  promptVisible: boolean;
  locating: boolean;
  allowLocation: () => void;
  dismissPrompt: () => void;
};

const DeliveryContext = createContext<DeliveryContextValue | null>(null);
// Separate so opening/closing the picker or prompt doesn't re-render every product card.
const LocationUiContext = createContext<LocationUiContextValue | null>(null);

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode) — the choice just lasts for this visit.
  }
}

/**
 * Session-level (same tier as cart/wishlist): every product card and the
 * header read the shopper's emirate. Client-only — the server renders the
 * no-location estimate and the real one applies after hydration, so cached
 * pages never bake in one visitor's location or the time of day.
 */
export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [emirate, setEmirateState] = useState<string | null>(null);
  const [pastCutoff, setPastCutoff] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  // Only true from the visit after the browser popup was first shown, so the
  // in-page prompt never stacks on top of the native one.
  const [askedBefore, setAskedBefore] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [locating, setLocating] = useState(false);

  const setEmirate = useCallback((next: string) => {
    setEmirateState(next);
    writeStorage(EMIRATE_STORAGE_KEY, next);
  }, []);

  const detectLocation = useCallback(
    () =>
      new Promise<DetectResult>((resolve) => {
        if (!("geolocation" in navigator)) {
          resolve("error");
          return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocating(false);
            const match = emirateFromCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            if (!match) {
              resolve("outside");
              return;
            }
            setEmirate(match.name);
            resolve("ok");
          },
          (error) => {
            setLocating(false);
            if (error.code === error.PERMISSION_DENIED) setPermission("denied");
            resolve("error");
          },
          { timeout: 10_000 },
        );
      }),
    [setEmirate],
  );

  useEffect(() => {
    const refreshCutoff = () => setPastCutoff(isPastSameDayCutoff());
    refreshCutoff();
    const timer = window.setInterval(refreshCutoff, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = readStorage(EMIRATE_STORAGE_KEY);
    if (isEmirateName(saved)) {
      // Deferred so setState doesn't run synchronously in the effect body
      // (same pattern as store/wishlist.tsx).
      Promise.resolve().then(() => setEmirateState(saved));
      return;
    }
    if (!("geolocation" in navigator)) return;

    let cancelled = false;
    let status: PermissionStatus | null = null;
    const wasAsked = readStorage(PROMPTED_STORAGE_KEY) !== null;

    const onPermissionChange = () => {
      if (!status) return;
      setPermission(status.state);
      // Shopper allowed it from the browser's site settings.
      if (status.state === "granted") void detectLocation();
    };

    (async () => {
      // Not every browser supports querying geolocation; treat that as "prompt".
      try {
        status = await navigator.permissions.query({ name: "geolocation" });
      } catch {
        status = null;
      }
      if (cancelled) return;

      const state: PermissionState = status?.state ?? "prompt";
      setPermission(state);
      setAskedBefore(wasAsked);
      setDismissed(readStorage(BANNER_DISMISSED_STORAGE_KEY) !== null);
      if (status) status.onchange = onPermissionChange;

      if (state === "granted") {
        // Already allowed — no popup involved.
        void detectLocation();
      } else if (state === "prompt" && !wasAsked) {
        // First visit: the browser's own popup. Once per browser — re-asking
        // on every load is what gets sites blocked.
        writeStorage(PROMPTED_STORAGE_KEY, "1");
        void detectLocation();
      }
    })();

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, [detectLocation]);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const allowLocation = useCallback(() => {
    // Runs from a click, which browsers treat as a stronger signal than a
    // load-time request, so the popup shows again after an earlier dismissal.
    void detectLocation().then((result) => {
      // Denied, timed out, or outside the UAE — let them choose by hand.
      if (result !== "ok") setPickerOpen(true);
    });
  }, [detectLocation]);

  const dismissPrompt = useCallback(() => {
    setDismissed(true);
    writeStorage(BANNER_DISMISSED_STORAGE_KEY, "1");
  }, []);

  const promptVisible =
    emirate === null &&
    askedBefore &&
    !dismissed &&
    !pickerOpen &&
    permission === "prompt";

  const deliveryValue = useMemo(
    () => ({ emirate, setEmirate, pastCutoff }),
    [emirate, setEmirate, pastCutoff],
  );
  const uiValue = useMemo(
    () => ({
      open: pickerOpen,
      openPicker,
      closePicker,
      detectLocation,
      promptVisible,
      locating,
      allowLocation,
      dismissPrompt,
    }),
    [
      pickerOpen,
      openPicker,
      closePicker,
      detectLocation,
      promptVisible,
      locating,
      allowLocation,
      dismissPrompt,
    ],
  );

  return (
    <DeliveryContext.Provider value={deliveryValue}>
      <LocationUiContext.Provider value={uiValue}>{children}</LocationUiContext.Provider>
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used within a DeliveryProvider");
  return ctx;
}

export function useLocationUi() {
  const ctx = useContext(LocationUiContext);
  if (!ctx) throw new Error("useLocationUi must be used within a DeliveryProvider");
  return ctx;
}

export function useDeliveryEstimate(available: boolean) {
  const { emirate, pastCutoff } = useDelivery();
  const { delivery } = useDictionary();
  return getDeliveryEstimate({ emirate, available, pastCutoff, t: delivery });
}
