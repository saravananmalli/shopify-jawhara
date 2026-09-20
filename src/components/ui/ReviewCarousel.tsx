"use client";

import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { useScrollCarousel } from "@/hooks/useScrollCarousel";

/** Scroll-snap row for review cards, with prev/next arrows when it overflows. */
export default function ReviewCarousel({
  itemCount,
  children,
}: {
  itemCount: number;
  children: ReactNode;
}) {
  const { scrollRef, pageCount, scrollByPage } = useScrollCarousel(itemCount);

  const arrowClass =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brown-900 shadow-md ring-1 ring-black/5 transition-colors hover:bg-cream-100";

  return (
    <div className="relative">
      {/* `relative` so the cards' absolutely-positioned sr-only text is clipped
          by this scroller instead of widening the whole page. */}
      <div
        ref={scrollRef}
        className="relative snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex items-start gap-6">{children}</ul>
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Previous reviews"
            className={`${arrowClass} left-1`}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Next reviews"
            className={`${arrowClass} right-1`}
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
