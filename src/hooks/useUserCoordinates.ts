"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/utils/geo";

/**
 * The visitor's position for distance sorting. Kept local to the page that
 * asks (never stored or shared): only an explicit `locate()` click can raise a
 * browser permission popup. On load it reads the position silently, and only
 * when the permission was already granted — so returning shoppers see nearby
 * stores first without being asked again.
 */
export function useUserCoordinates() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setDenied(true);
      return;
    }
    setLocating(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => {
        setDenied(true);
        setLocating(false);
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator) || !navigator.permissions) return;

    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") locate();
      })
      .catch(() => {
        // Permissions API unsupported for geolocation — wait for a click.
      });
    return () => {
      cancelled = true;
    };
  }, [locate]);

  return { coordinates, locating, denied, locate };
}
