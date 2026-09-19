"use client";

import Image from "next/image";
import Link from "next/link";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Chip from "@/components/ui/Chip";
import { ChevronRightIcon, SparkleIcon } from "@/components/icons";
import { useStickyScrollProgress } from "@/hooks/useStickyScrollProgress";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { Occasion } from "@/types/content";

// 2x the largest rendered width (50vw of the 1440px max-w-8xl container).
const OCCASION_IMAGE_WIDTH = 1600;

export default function ShopByOccasionSection({
  occasions,
}: {
  occasions: Occasion[];
}) {
  const { sectionRef, activeIndex, headerOffset } = useStickyScrollProgress(
    occasions.length,
  );

  // Real data or nothing — the "occasion" metaobject definition may not
  // exist yet, or every entry may be unpublished (Active: false).
  if (occasions.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream-100"
      style={{ height: `${occasions.length * 100}vh` }}
    >
      <div
        className="sticky flex flex-col overflow-hidden"
        style={{ top: headerOffset, height: `calc(100vh - ${headerOffset}px)` }}
      >
        <div className="mx-auto w-full max-w-8xl px-4 pt-14 text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
            Curated By Moment
          </p>
          <h2 className="mt-1 font-sans text-3xl font-normal sm:text-4xl">
            Shop by Occasion
          </h2>
        </div>

        <div className="relative mx-auto w-full max-w-8xl flex-1">
          {occasions.map((occasion, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={occasion.id}
                aria-hidden={!isActive}
                // `px-4` lives on this absolutely-positioned panel itself,
                // not the `relative` ancestor above — an `inset-0` child's
                // containing block is the ancestor's padding box, so padding
                // set on the ancestor gets bypassed and the panel would
                // otherwise render flush to the edge.
                className={`absolute inset-0 flex flex-col gap-6 px-4 py-4 transition-[opacity,transform] duration-700 ease-luxury lg:flex-row lg:items-center lg:gap-10 lg:py-8 ${
                  isActive
                    ? "opacity-100 translate-y-0 scale-100"
                    : "pointer-events-none opacity-0 translate-y-4 scale-[0.98]"
                }`}
              >
                <div className="min-h-0 flex-1 overflow-y-auto lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:overflow-visible">
                  {occasion.badgeLabel && (
                    <Chip className="mb-3 self-start">
                      <SparkleIcon className="h-3.5 w-3.5" /> {occasion.badgeLabel}
                    </Chip>
                  )}
                  <h3 className="font-sans text-3xl leading-tight text-brown-900 sm:text-4xl">
                    {occasion.title}
                    {occasion.tagline && (
                      <>
                        <br />
                        <span className="italic text-gold-700">{occasion.tagline}</span>
                      </>
                    )}
                  </h3>
                  <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-brown-900/70">
                    {occasion.description}
                  </p>
                  <Link
                    href={occasion.ctaHref}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-gold-600 px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-gold-700"
                  >
                    {occasion.ctaLabel} <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>

                {/* The panel height is locked to the viewport (it's pinned),
                    so the image fills whatever box it's given (h-full within
                    a shrink-0 row on mobile, h-full/w-1/2 on desktop) instead
                    of dictating its own aspect ratio — an aspect-ratio image
                    tall enough for a normal flowing section would overflow a
                    fixed-height one. */}
                <div className="relative h-[42%] w-full shrink-0 overflow-hidden rounded-2xl lg:h-full lg:w-1/2">
                  {occasion.imageUrl ? (
                    <Image
                      src={getShopifyImageUrl(occasion.imageUrl, OCCASION_IMAGE_WIDTH)}
                      alt={occasion.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover"
                    />
                  ) : (
                    <PlaceholderImage className="h-full w-full" label={occasion.title} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-8 w-full">
          <div className="mx-auto flex max-w-8xl items-center gap-3 px-4">
            <span className="font-sans text-xs font-semibold tabular-nums text-brown-900/60">
              {String(activeIndex + 1).padStart(2, "0")} / {String(occasions.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2" role="presentation">
              {occasions.map((occasion, index) => (
                <span
                  key={occasion.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-luxury ${
                    index === activeIndex ? "w-6 bg-gold-600" : "w-1.5 bg-gold-600/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
