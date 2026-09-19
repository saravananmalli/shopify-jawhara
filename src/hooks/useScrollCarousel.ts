"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives a horizontally-scrollable row as a paginated carousel: tracks how
 * many real "pages" of content exist (viewport-widths of scrollable
 * content, not one dot per item) and which page is currently in view, and
 * exposes prev/next handlers that scroll by one page. Shared by any
 * horizontal scroll-snap strip (CategoryStrip, ProductGridSection, ...)
 * instead of re-deriving this per component.
 */
export function useScrollCarousel(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updatePageCount = () => {
      setPageCount(Math.max(1, Math.ceil(container.scrollWidth / container.clientWidth)));
    };

    updatePageCount();
    const observer = new ResizeObserver(updatePageCount);
    observer.observe(container);
    return () => observer.disconnect();
  }, [itemCount]);

  const scrollByPage = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction * container.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    // The last page is usually partial (less than a full clientWidth of
    // content), so scrollLeft maxes out short of clientWidth * (pageCount-1)
    // — map proportionally across the real scrollable range instead of
    // dividing by a fixed page width, or the final page never registers.
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (maxScrollLeft <= 0) {
      setActivePage(0);
      return;
    }
    const page = Math.round((container.scrollLeft / maxScrollLeft) * (pageCount - 1));
    setActivePage(Math.max(0, Math.min(page, pageCount - 1)));
  };

  return { scrollRef, pageCount, activePage, scrollByPage, handleScroll };
}
