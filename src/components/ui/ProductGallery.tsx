"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { ProductImage } from "@/types/product";

// Main image: ~2x its ~680px slot at 1440px wide. Thumbnails: 2x the 72px tile.
const MAIN_IMAGE_WIDTH = 1200;
const THUMBNAIL_IMAGE_WIDTH = 144;
// Hover zoom magnifies 2.2x, so the photo is upgraded to a larger rendition the
// first time the mouse enters — the resting page keeps the lighter 1200px one.
const ZOOM_SCALE = 2.2;
const ZOOM_IMAGE_WIDTH = 2400;

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
              aria-label={`View image ${index + 1} of ${images.length}`}
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
          <span className="absolute left-4 top-4 z-10 rounded-full border border-[#E6D7BE] bg-white/95 px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[2.2px] text-gold-600 shadow-sm">
            {badge}
          </span>
        )}
        <div
          className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl"
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
      </div>
    </div>
  );
}
