"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
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
// Least horizontal travel (px) that counts as a swipe rather than a tap.
const SWIPE_THRESHOLD_PX = 40;

export default function ProductGallery({
  images,
  title,
  badge,
}: {
  images: ProductImage[];
  title: string;
  /** e.g. "Dubai Flagship Exclusive" — only when a real product tag maps to one. */
  badge?: string | null;
}) {
  const { product: t } = useDictionary();
  const isRtl = useLocale() === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<string | null>(null);
  const [zoomLoaded, setZoomLoaded] = useState(false);

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
    setActiveIndex((current) => Math.min(images.length - 1, Math.max(0, current + step)));
  };

  if (images.length === 0) {
    return (
      <PlaceholderImage className="aspect-square w-full rounded-2xl" label={title} />
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={formatMessage(t.viewImage, { n: index + 1, total: images.length })}
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
                ? { transform: `scale(${ZOOM_SCALE})`, transformOrigin: zoomOrigin }
                : undefined
            }
          />
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {images.map((image, index) => (
              <span
                key={image.url}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-gold-600" : "w-1.5 bg-brown-900/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
