"use client";

import { useEffect, useState } from "react";

/**
 * Rotating header text lives in its own leaf components so each tick
 * re-renders only a <span>, not the whole Header (mega-menus, nav, drawers).
 */
function useRotatingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);

  return index;
}

const ANNOUNCEMENTS = [
  "4-Hr Delivery in Dubai on Select Pieces",
  "Extra 10% OFF Selected Jewellery. Discount auto-applied at checkout.",
  "Free Delivery Across UAE",
];
const ANNOUNCEMENT_INTERVAL_MS = 4000;

export function AnnouncementTicker() {
  const index = useRotatingIndex(ANNOUNCEMENTS.length, ANNOUNCEMENT_INTERVAL_MS);

  return (
    <span
      key={index}
      className="animate-announcement-fade truncate px-4 text-center font-medium"
    >
      {ANNOUNCEMENTS[index]}
    </span>
  );
}

const SEARCH_SUGGESTIONS = [
  "Ring",
  "Pendant",
  "Necklace",
  "Earring",
  "Bangle",
  "Gold Necklace",
  "Wedding Ring",
];
const SEARCH_SUGGESTION_INTERVAL_MS = 2200;

/** The "Search for “Ring”" hint inside the search trigger buttons. */
export function SearchHint() {
  const index = useRotatingIndex(SEARCH_SUGGESTIONS.length, SEARCH_SUGGESTION_INTERVAL_MS);

  return (
    <>
      Search for{" "}
      <span
        key={index}
        className="animate-announcement-fade inline-block text-brown-900/70"
      >
        &ldquo;{SEARCH_SUGGESTIONS[index]}&rdquo;
      </span>
    </>
  );
}
