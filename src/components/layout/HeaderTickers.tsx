"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";

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

const ANNOUNCEMENT_INTERVAL_MS = 4000;

export function AnnouncementTicker() {
  const { announcements } = useDictionary().header;
  const index = useRotatingIndex(announcements.length, ANNOUNCEMENT_INTERVAL_MS);

  return (
    <span
      key={index}
      className="animate-announcement-fade truncate px-4 text-center font-medium"
    >
      {announcements[index]}
    </span>
  );
}

const SEARCH_SUGGESTION_INTERVAL_MS = 2200;

/** The "Search for “Ring”" hint inside the search trigger buttons. */
export function SearchHint() {
  const { searchHint, searchSuggestions } = useDictionary().header;
  const index = useRotatingIndex(searchSuggestions.length, SEARCH_SUGGESTION_INTERVAL_MS);

  // The template is split around the term so the term can animate on its own
  // while the surrounding sentence keeps each language's own word order.
  const [before, after] = formatMessage(searchHint, { term: "\u0000" }).split("\u0000");

  return (
    <>
      {before}
      <span
        key={index}
        className="animate-announcement-fade inline-block text-brown-900/70"
      >
        &ldquo;{searchSuggestions[index]}&rdquo;
      </span>
      {after}
    </>
  );
}
