"use client";

import { useState } from "react";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { ProductImage } from "@/types/product";

// Main image: ~2x a 50vw-of-1440px column. Thumbnails: 2x the 112px tile.
const MAIN_IMAGE_WIDTH = 1200;
const THUMBNAIL_IMAGE_WIDTH = 224;

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

  if (images.length === 0) {
    return (
      <PlaceholderImage className="aspect-square w-full rounded-2xl" label={title} />
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={index === activeIndex}
              className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-2 ${
                index === activeIndex ? "border-gold-600" : "border-transparent"
              }`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={getShopifyImageUrl(image.url, THUMBNAIL_IMAGE_WIDTH)}
                  alt=""
                  fill
                  sizes="112px"
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
      <div className="relative order-first flex-1 overflow-hidden rounded-3xl bg-white p-3 shadow-md sm:order-2 sm:p-4">
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full border border-[#E6D7BE] bg-white/95 px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[2.2px] text-gold-600 shadow-sm">
            {badge}
          </span>
        )}
        <div className="relative aspect-square w-full">
          <Image
            src={getShopifyImageUrl(active.url, MAIN_IMAGE_WIDTH)}
            alt={active.altText}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
