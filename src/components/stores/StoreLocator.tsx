"use client";

import { useId, useMemo, useState } from "react";
import StoreCard from "@/components/stores/StoreCard";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { CloseIcon, CrosshairIcon, SearchIcon } from "@/components/icons";
import { useUserCoordinates } from "@/hooks/useUserCoordinates";
import { useDelivery } from "@/store/delivery";
import { distanceKm } from "@/utils/geo";
import { foldKey, isUaeCountry, uniqueValues } from "@/utils/stores";
import type { StoreLocation } from "@/types/content";

const ALL_COUNTRIES = "All Countries";
const ALL_REGIONS = "All Regions";

const FIELD_CLASS =
  "h-11 w-full rounded-lg border border-gold-100 bg-white text-sm text-brown-900 transition-colors duration-300 ease-luxury focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-600/15";

export default function StoreLocator({ stores }: { stores: StoreLocation[] }) {
  const { emirate } = useDelivery();
  const {
    coordinates: userCoordinates,
    locating,
    denied: locationDenied,
    locate,
  } = useUserCoordinates();
  const searchId = useId();

  const [search, setSearch] = useState("");
  // Country/Region follow the shopper's detected emirate until they pick one
  // themselves; a manual pick always wins, so a later detection update can
  // never overwrite it. Derived at render time rather than synced by effects.
  const [countryOverride, setCountryOverride] = useState<string | null>(null);
  const [regionOverride, setRegionOverride] = useState<string | null>(null);

  // Filter options come from the store data — never hardcoded.
  const countries = useMemo(
    () => [ALL_COUNTRIES, ...uniqueValues(stores, "country")],
    [stores],
  );

  const autoCountry = useMemo(
    () => (emirate ? countries.find((c) => c !== ALL_COUNTRIES && isUaeCountry(c)) ?? null : null),
    [countries, emirate],
  );
  const country = countryOverride ?? autoCountry ?? ALL_COUNTRIES;

  const regions = useMemo(() => {
    const scoped =
      country === ALL_COUNTRIES
        ? stores
        : stores.filter((store) => foldKey(store.country) === foldKey(country));
    return [ALL_REGIONS, ...uniqueValues(scoped, "region")];
  }, [stores, country]);

  const autoRegion = useMemo(() => {
    // Only when the country itself was auto-matched, not picked.
    if (countryOverride || !autoCountry || !emirate) return null;
    return regions.find((r) => r !== ALL_REGIONS && foldKey(r) === foldKey(emirate)) ?? null;
  }, [countryOverride, autoCountry, emirate, regions]);
  const region = regionOverride ?? autoRegion ?? ALL_REGIONS;

  const handleCountryChange = (value: string) => {
    setCountryOverride(value);
    setRegionOverride(ALL_REGIONS);
  };

  // Detection alone only prioritises; a manual pick hides other stores.
  const isCountryFiltered = countryOverride !== null && countryOverride !== ALL_COUNTRIES;
  const isRegionFiltered = regionOverride !== null && regionOverride !== ALL_REGIONS;
  const isFiltered = isCountryFiltered || isRegionFiltered;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const countryKey = foldKey(country);
    const regionKey = foldKey(region);

    const withDistance = stores
      .filter(
        (store) =>
          !term ||
          store.name.toLowerCase().includes(term) ||
          store.address.toLowerCase().includes(term),
      )
      .filter((store) => {
        if (isCountryFiltered && foldKey(store.country) !== countryKey) return false;
        if (isRegionFiltered) {
          if (foldKey(store.region) !== regionKey) return false;
          if (country !== ALL_COUNTRIES && foldKey(store.country) !== countryKey) return false;
        }
        return true;
      })
      .map((store) => ({
        store,
        distance:
          userCoordinates && store.coordinates
            ? distanceKm(userCoordinates, store.coordinates)
            : null,
      }));

    // With a real position, true distance is the primary sort — a stale
    // auto-matched country must never outrank a store that is actually closer.
    if (userCoordinates) {
      return withDistance.sort((a, b) => {
        if (a.distance === null) return b.distance === null ? 0 : 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    if (isFiltered) return withDistance;

    // No position: the detected country/region only decide the order.
    const tier = ({ store }: { store: StoreLocation }) => {
      if (country === ALL_COUNTRIES) return 0;
      const inCountry = foldKey(store.country) === countryKey;
      if (region !== ALL_REGIONS) {
        if (inCountry && foldKey(store.region) === regionKey) return 0;
        return inCountry ? 1 : 2;
      }
      return inCountry ? 0 : 1;
    };
    return withDistance.sort((a, b) => tier(a) - tier(b));
  }, [stores, search, country, region, userCoordinates, isCountryFiltered, isRegionFiltered, isFiltered]);

  const nearestId =
    !isFiltered && userCoordinates && visible[0]?.distance != null ? visible[0].store.id : null;

  const resetFilters = () => {
    setSearch("");
    setCountryOverride(ALL_COUNTRIES);
    setRegionOverride(ALL_REGIONS);
  };

  const plural = visible.length !== 1 ? "s" : "";
  let countLabel: string;
  if (isFiltered) {
    const place = isRegionFiltered
      ? country === ALL_COUNTRIES
        ? region
        : `${region}, ${country}`
      : country;
    countLabel = `Showing ${visible.length} store${plural} in ${place}`;
  } else {
    const order = userCoordinates
      ? " · sorted by distance"
      : region !== ALL_REGIONS
        ? ` · ${region} stores shown first`
        : country !== ALL_COUNTRIES
          ? ` · ${country} stores shown first`
          : "";
    countLabel = `Showing all ${visible.length} store${plural}${order}`;
  }

  if (stores.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-brown-900/70">
          Our store locations will be listed here soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search stores by name or location
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-900/50" />
          <input
            id={searchId}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search stores by name or location…"
            autoComplete="off"
            className={`${FIELD_CLASS} pl-11 pr-11 placeholder:text-brown-900/40`}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-brown-900/60 hover:text-brown-900 focus-visible:outline-2 focus-visible:outline-gold-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <SelectDropdown
          className="min-w-40 flex-1 sm:flex-none"
          label="Filter by country"
          value={country}
          options={countries}
          onChange={handleCountryChange}
        />
        <SelectDropdown
          className="min-w-40 flex-1 sm:flex-none"
          label="Filter by region"
          value={region}
          options={regions}
          onChange={setRegionOverride}
        />

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-gold-600 px-5 text-sm font-semibold text-white transition-colors duration-300 ease-luxury hover:bg-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CrosshairIcon className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating…" : userCoordinates ? "Update my location" : "Show nearby stores"}
        </button>
      </div>

      {locationDenied && (
        <p role="status" className="mt-4 text-sm text-brown-900/60">
          We couldn&apos;t access your location. You can still browse all stores below.
        </p>
      )}

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base text-brown-900/70">No stores match your search.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-gold-600 px-6 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-luxury hover:bg-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <p role="status" className="mb-6 mt-6 text-sm text-brown-900/60">
            {countLabel}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ store, distance }) => (
              <StoreCard
                key={store.id}
                store={store}
                distanceKm={distance}
                nearest={store.id === nearestId}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
