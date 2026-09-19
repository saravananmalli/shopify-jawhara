"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export default function CarouselPagination({
  pageCount,
  activePage,
  onPrev,
  onNext,
  label,
  className = "mx-auto mt-4 max-w-8xl px-4",
}: {
  pageCount: number;
  activePage: number;
  onPrev: () => void;
  onNext: () => void;
  label: string;
  /** Outer wrapper classes — override when the parent already provides the gutter. */
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: pageCount }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activePage ? "w-6 bg-gold-600" : "w-1.5 bg-brown-900/15"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label={`Previous ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6D3D1] text-brown-900 transition-colors hover:bg-cream-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Next ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6D3D1] text-brown-900 transition-colors hover:bg-cream-100"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
