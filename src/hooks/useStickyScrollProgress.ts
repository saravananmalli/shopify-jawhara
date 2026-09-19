"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives a pinned (position: sticky) section made of `count` stacked panels:
 * as the user scrolls through the section's height, `activeIndex`
 * advances/retreats to match how far they've scrolled — no scroll-jacking,
 * native scroll stays in control (works with wheel, touch, keyboard paging,
 * and screen-reader scroll alike). The scroll listener is only attached
 * while the section is near the viewport (IntersectionObserver gated) and
 * reads happen inside requestAnimationFrame, so idle scrolling elsewhere on
 * the page never touches this section's JS.
 *
 * The site header is itself `position: sticky` (Header.tsx) and sits above
 * this section in the stacking order, so the panel can't simply pin to
 * `top: 0` / `100vh` — it would render underneath the header. `headerOffset`
 * is measured from the live header element (its height varies by
 * breakpoint) so the caller can pin the panel to `top: headerOffset` /
 * `height: 100vh - headerOffset`, and the progress math below is derived
 * from that same offset so the two stay in sync.
 */
export function useStickyScrollProgress(count: number) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const computeIndex = () => {
      const offset = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      setHeaderOffset(offset);

      const rect = section.getBoundingClientRect();
      const panelHeight = window.innerHeight - offset;
      const scrollable = rect.height - panelHeight;
      if (scrollable <= 0) {
        setActiveIndex(0);
        return;
      }
      const progress = Math.min(1, Math.max(0, (offset - rect.top) / scrollable));
      setActiveIndex(Math.min(count - 1, Math.round(progress * (count - 1))));
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        computeIndex();
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const isNearby = entries[0]?.isIntersecting ?? false;
      if (isNearby) {
        computeIndex();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    observer.observe(section);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return { sectionRef, activeIndex, headerOffset };
}
