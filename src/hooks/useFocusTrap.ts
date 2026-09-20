"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Dialogs can overlap (e.g. a search overlay opening from the mobile menu), so
// the page scrolls again only when the last one closes.
let scrollLocks = 0;
let scrollLockRestore = "";

function lockPageScroll() {
  if (scrollLocks++ === 0) {
    scrollLockRestore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  return () => {
    if (--scrollLocks === 0) document.body.style.overflow = scrollLockRestore;
  };
}

/**
 * Traps Tab focus inside `ref`, locks page scroll and closes on Escape while
 * `active`. Required for any modal/drawer per the a11y rules in CLAUDE.md (#28).
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!active) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];

    const unlockScroll = lockPageScroll();
    focusables()[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      previouslyFocused?.focus();
    };
  }, [active, ref, onClose]);
}
