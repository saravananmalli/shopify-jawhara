"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { ProductImage } from "@/types/product";

// Main image: ~2x its ~680px slot at 1440px wide. Thumbnails: 2x the 72px tile.
const MAIN_IMAGE_WIDTH = 1200;
const THUMBNAIL_IMAGE_WIDTH = 144;
// Hover zoom magnifies 2.2x, so the photo is upgraded to a larger rendition the
// first time the mouse enters — the resting page keeps the lighter 1200px one.
const ZOOM_SCALE = 2.2;
const ZOOM_IMAGE_WIDTH = 2400;
const THUMBNAIL_SIZE_PX = 72;
const THUMBNAIL_GAP_PX = 8;
// Least horizontal travel (px) that counts as a swipe rather than a tap.
const SWIPE_THRESHOLD_PX = 40;

export default function ProductGallery({
  images,
  title,
  badge,
  focusImageUrl = null,
}: {
  images: ProductImage[];
  title: string;
  /** Jump to this photo when it changes (the selected colour's own photo). */
  focusImageUrl?: string | null;
  /** e.g. "Dubai Flagship Exclusive" — only when a real product tag maps to one. */
  badge?: string | null;
}) {
  const isRtl = useLocale() === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<string | null>(null);
  const [zoomLoaded, setZoomLoaded] = useState(false);

  // Adjusting state while rendering (not an effect) so the new photo shows in
  // the same paint as the variant change.
  const [seenFocusUrl, setSeenFocusUrl] = useState(focusImageUrl);
  if (focusImageUrl !== seenFocusUrl) {
    setSeenFocusUrl(focusImageUrl);
    const index = images.findIndex((image) => image.url === focusImageUrl);
    if (index >= 0) setActiveIndex(index);
  }

  // Mouse only: on touch screens a "hover" would leave the image stuck zoomed.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100);
    setZoomOrigin(`${x}% ${y}%`);
    setZoomLoaded(true);
  };

  // Touch/pen swipe between photos. `touch-pan-y` on the image keeps vertical
  // page scroll while handing horizontal drags to these handlers. Mouse is left
  // to the hover zoom above.
  const swipeStartX = useRef<number | null>(null);
  const handleSwipeStart = (event: PointerEvent) => {
    swipeStartX.current = event.pointerType === "mouse" ? null : event.clientX;
  };
  const handleSwipeEnd = (event: PointerEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    // Swiping toward the start edge shows the next photo, in either direction.
    const step = deltaX < 0 !== isRtl ? 1 : -1;
    setActiveIndex((current) =>
      Math.min(images.length - 1, Math.max(0, current + step)),
    );
  };

  if (images.length === 0) {
    return (
      <PlaceholderImage
        className="aspect-square w-full rounded-2xl"
        label={title}
      />
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {images.length > 1 && (
        <ThumbnailStrip
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          isRtl={isRtl}
        />
      )}

      {/* The card (padding, shadow) is separate from the aspect-square
          image area inside it, so the product photo floats with a little
          breathing room instead of filling the box edge to edge — matches
          the reference's "framed" presentation. */}
      <div className="relative order-first flex-1 overflow-hidden rounded-3xl bg-white p-2.5 shadow-md sm:order-2">
        {badge && (
          <span className="absolute start-4 top-4 z-10 rounded-full border border-[#E6D7BE] bg-white/95 px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[2.2px] text-gold-600 shadow-sm">
            {badge}
          </span>
        )}
        <div
          className="relative aspect-square w-full cursor-zoom-in touch-pan-y overflow-hidden rounded-3xl"
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={() => (swipeStartX.current = null)}
          onDragStart={(event) => event.preventDefault()}
          onPointerEnter={handlePointerMove}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setZoomOrigin(null)}
        >
          <Image
            src={getShopifyImageUrl(
              active.url,
              zoomLoaded ? ZOOM_IMAGE_WIDTH : MAIN_IMAGE_WIDTH,
            )}
            alt={active.altText}
            fill
            sizes={zoomLoaded ? "110vw" : "(min-width: 1024px) 50vw, 100vw"}
            priority
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-contain transition-transform duration-(--motion-fast) ease-luxury"
            style={
              zoomOrigin
                ? {
                    transform: `scale(${ZOOM_SCALE})`,
                    transformOrigin: zoomOrigin,
                  }
                : undefined
            }
          />
        </div>
        {images.length > 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden"
            aria-hidden
          >
            {images.map((image, index) => (
              <span
                key={image.url}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-5 bg-gold-600"
                    : "w-1.5 bg-brown-900/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Thumbnails: a row on phones, a column from sm. Arrows appear only when there
 * are more photos than fit, and scroll the strip. */
function ThumbnailStrip({
  images,
  activeIndex,
  onSelect,
  isRtl,
}: {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isRtl: boolean;
}) {
  const { common, product: t } = useDictionary();
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  // One strip scrolls on one axis at a time (row on phones, column from sm),
  // so both axes are checked. `scrollLeft` is negative in RTL — hence abs().
  const updateArrows = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const scrolledX = Math.abs(strip.scrollLeft);
    setCanScrollBack(strip.scrollTop > 1 || scrolledX > 1);
    setCanScrollForward(
      strip.scrollTop + strip.clientHeight < strip.scrollHeight - 1 ||
        scrolledX + strip.clientWidth < strip.scrollWidth - 1,
    );
  };

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    updateArrows();
    const observer = new ResizeObserver(updateArrows);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [images.length]);

  // Keep the selected thumbnail in view without scrolling the page itself
  // (scrollIntoView would move every ancestor too).
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const stripRect = strip.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const top =
      Math.min(0, thumbRect.top - stripRect.top) ||
      Math.max(0, thumbRect.bottom - stripRect.bottom);
    const left =
      Math.min(0, thumbRect.left - stripRect.left) ||
      Math.max(0, thumbRect.right - stripRect.right);
    if (top || left) strip.scrollBy({ top, left, behavior: "smooth" });
  }, [activeIndex]);

  // "Back" is toward the strip's start: up in the column; left in LTR / right
  // in RTL for the row.
  const scrollStrip = (direction: 1 | -1) => {
    const strip = stripRef.current;
    if (!strip) return;
    const isColumn = strip.scrollHeight > strip.clientHeight + 1;
    const step = Math.max(
      THUMBNAIL_SIZE_PX + THUMBNAIL_GAP_PX,
      (isColumn ? strip.clientHeight : strip.clientWidth) * 0.8,
    );
    strip.scrollBy({
      top: isColumn ? direction * step : 0,
      left: isColumn ? 0 : direction * step * (isRtl ? -1 : 1),
      behavior: "smooth",
    });
  };

  const arrowClass =
    "flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brown-900 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-cream-100";
  const showArrows = canScrollBack || canScrollForward;

  return (
    // From sm the strip is as tall as the main photo (self-stretch), but absolutely
    // positioned inside so a long list of thumbnails can't make the row taller:
    // the arrows then sit at the photo's top and bottom edges.
    <div className="min-w-0 sm:relative sm:order-1 sm:w-[72px] sm:self-stretch">
      <div className="flex min-w-0 items-center gap-2 sm:absolute sm:inset-0 sm:flex-col">
        {showArrows && (
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            disabled={!canScrollBack}
            aria-label={formatMessage(common.previous, {
              label: t.imagesLabel,
            })}
            className={`${arrowClass} disabled:opacity-40`}
          >
            <ChevronLeftIcon className="size-4 sm:hidden" />
            <ChevronDownIcon className="hidden size-4 rotate-180 sm:block" />
          </button>
        )}

        <div
          ref={stripRef}
          onScroll={updateArrows}
          className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:min-h-0 sm:w-full sm:flex-1 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={formatMessage(t.viewImage, {
                n: index + 1,
                total: images.length,
              })}
              aria-pressed={index === activeIndex}
              className={`relative size-[72px] shrink-0 overflow-hidden rounded-3xl border-2 bg-white p-[3px] ${
                index === activeIndex ? "border-gold-600" : "border-transparent"
              }`}
            >
              <div className="relative h-full w-full overflow-hidden rounded-3xl">
                <Image
                  src={getShopifyImageUrl(image.url, THUMBNAIL_IMAGE_WIDTH)}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain"
                />
              </div>
            </button>
          ))}
        </div>

        {showArrows && (
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            disabled={!canScrollForward}
            aria-label={formatMessage(common.next, { label: t.imagesLabel })}
            className={`${arrowClass} disabled:opacity-40`}
          >
            <ChevronRightIcon className="size-4 sm:hidden" />
            <ChevronDownIcon className="hidden size-4 sm:block" />
          </button>
        )}
      </div>
    </div>
  );
}
