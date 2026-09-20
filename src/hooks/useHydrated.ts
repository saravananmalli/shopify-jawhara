"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False for the server render and for the client's hydration render of the
 * component that calls it, true afterwards. Use it to gate anything derived
 * from browser-only state (localStorage, geolocation): the first client render
 * then matches the server HTML exactly.
 *
 * A provider's own "hydrated" flag isn't enough for boundaries that stream in
 * late (Suspense): they hydrate after the provider already loaded localStorage,
 * so their first render would already differ from the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
