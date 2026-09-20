"use client";

import { useEffect, useRef, useState } from "react";

/** Tailwind's `md` breakpoint — below it the section is a plain vertical stack. */
const PINNED_MIN_WIDTH = 768;
/** Same cap as the reference layout: the focused card is 90% of the viewport, max 1440px. */
const SLOT_WIDTH_RATIO = 0.9;
const SLOT_MAX_WIDTH = 1440;

/**
 * Pinned horizontal-scroll section: a `position: sticky` viewport holds a
 * row of `count` full-width slots, and vertical page scroll is mapped 1:1 onto
 * a horizontal `translateX` of that row. Native scroll stays in control (no
 * scroll-jacking), so wheel, touch, keyboard paging and screen-reader scroll
 * all keep working.
 *
 * Geometry is derived, not measured: slots are `--slot-w` wide and the track is
 * padded by `--slot-pad` so the first and last slot centre in the viewport, so
 * the travel distance is exactly `(count - 1) * (slot + gap)`. The section's
 * height is that distance plus the pinned viewport height, which makes
 * "scrolled distance == translated distance" hold with no easing layer.
 *
 * The site header is `position: sticky` and above this section, so the pinned
 * viewport sits at `--header-offset` (measured from the live header, whose
 * height varies by breakpoint) instead of `top: 0`.
 *
 * Everything per-frame is written straight to the DOM in rAF; React state is
 * touched only when the focused slot changes. The scroll listener is attached
 * only while the section is on screen.
 */
export function useHorizontalScrollSection(count: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let rafId: number | null = null;
    let distance = 0;
    let headerOffset = 0;
    let pinned = false;

    const measure = () => {
      pinned = window.innerWidth >= PINNED_MIN_WIDTH;
      setIsPinned(pinned);

      if (!pinned) {
        section.style.removeProperty("--section-h");
        track.style.transform = "";
        setActiveIndex(0);
        return;
      }

      headerOffset = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const viewportWidth = section.clientWidth;
      const slotWidth = Math.min(viewportWidth * SLOT_WIDTH_RATIO, SLOT_MAX_WIDTH);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      distance = Math.max(0, (count - 1) * (slotWidth + gap));

      section.style.setProperty("--header-offset", `${headerOffset}px`);
      section.style.setProperty("--slot-w", `${slotWidth}px`);
      section.style.setProperty("--slot-pad", `${(viewportWidth - slotWidth) / 2}px`);
      section.style.setProperty(
        "--section-h",
        `${distance + window.innerHeight - headerOffset}px`,
      );
    };

    const update = () => {
      rafId = null;
      if (!pinned) return;
      const scrolled = headerOffset - section.getBoundingClientRect().top;
      const progress = distance > 0 ? Math.min(1, Math.max(0, scrolled / distance)) : 0;
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
      setActiveIndex(Math.round(progress * (count - 1)));
    };

    const schedule = () => {
      if (rafId === null) rafId = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      schedule();
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        measure();
        schedule();
        window.addEventListener("scroll", schedule, { passive: true });
      } else {
        window.removeEventListener("scroll", schedule);
      }
    });

    measure();
    observer.observe(section);
    window.addEventListener("resize", onResize);
    // Images/fonts settling above the section change the header/viewport
    // geometry without a window resize.
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(section);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [count]);

  return { sectionRef, trackRef, activeIndex, isPinned };
}
