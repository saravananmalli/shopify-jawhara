"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Below this width the phone tab bar exists and the header/bar auto-hide (Tailwind's `md`). */
const PHONE_QUERY = "(max-width: 47.99rem)";
// Scroll travel (px) in one direction before the bars react, so finger jitter
// and momentum wobble don't flicker them.
const HIDE_AFTER_PX = 12;
const SHOW_AFTER_PX = 6;

/**
 * YouTube-style chrome on phones: the header and bottom tab bar slide away
 * while the shopper scrolls down and come back on the first scroll up. They
 * keep whatever state they are in when scrolling stops, and they are always
 * shown at the top of the page and after navigating.
 *
 * Renders nothing. It only sets `data-nav-hidden` on <html> (no React state, so
 * scrolling never re-renders) and publishes the header height as `--header-h`;
 * the slide itself is plain CSS (see globals.css, Header, BottomNav).
 */
export default function NavAutoHide() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const phone = window.matchMedia(PHONE_QUERY);
    let frame = 0;
    let lastY = window.scrollY;
    let direction: -1 | 0 | 1 = 0;
    let travelled = 0;
    let headerHeight = 0;

    const setHidden = (hidden: boolean) => {
      if (root.dataset.navHidden !== String(hidden)) root.dataset.navHidden = String(hidden);
    };

    const measureHeader = () => {
      headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      root.style.setProperty("--header-h", `${headerHeight}px`);
    };

    const update = () => {
      frame = 0;
      if (!phone.matches) {
        setHidden(false);
        return;
      }
      // iOS rubber-banding reports scroll positions outside the real range;
      // clamping keeps the bounce-back from looking like a scroll up.
      const max = Math.max(0, root.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(window.scrollY, 0), max);
      const delta = y - lastY;
      lastY = y;

      if (y <= headerHeight) {
        setHidden(false);
        direction = 0;
        travelled = 0;
        return;
      }
      if (delta === 0) return;

      const next = delta > 0 ? 1 : -1;
      if (next !== direction) {
        direction = next;
        travelled = 0;
      }
      travelled += Math.abs(delta);

      if (direction === 1 && travelled >= HIDE_AFTER_PX) setHidden(true);
      else if (direction === -1 && travelled >= SHOW_AFTER_PX) setHidden(false);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Tabbing into the header (or a bar control) must never land on a hidden bar.
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as Element | null)?.closest("header, nav.fixed")) setHidden(false);
    };

    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    const header = document.querySelector("header");
    if (header) observer.observe(header);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.navHidden;
    };
  }, []);

  // A new page starts scrolled to the top with the bars showing.
  useEffect(() => {
    document.documentElement.dataset.navHidden = "false";
  }, [pathname]);

  return null;
}
