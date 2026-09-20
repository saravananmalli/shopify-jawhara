"use client";

import Image from "next/image";
import Link from "@/components/ui/Link";
import Chip from "@/components/ui/Chip";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { ArrowUpRightIcon, SparkleIcon } from "@/components/icons";
import { useDictionary } from "@/store/locale";
import { useHorizontalScrollSection } from "@/hooks/useHorizontalScrollSection";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { Occasion } from "@/types/content";

// 2x the widest rendered card (90vw capped at 1440px).
const OCCASION_IMAGE_WIDTH = 2400;

const pad = (n: number) => String(n).padStart(2, "0");

export default function ShopByOccasionSection({
  occasions,
}: {
  occasions: Occasion[];
}) {
  const t = useDictionary().home.occasions;
  const { sectionRef, trackRef, activeIndex, isPinned } = useHorizontalScrollSection(
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
      aria-labelledby="shop-by-occasion-heading"
      className="bg-cream-100 py-6 sm:py-14 md:h-(--section-h) md:py-0"
    >
      {/* Below md this is an ordinary vertical stack; from md up it pins under
          the header while the hook slides the track sideways. */}
      <div className="md:sticky md:top-(--header-offset) md:flex md:h-[calc(100vh-var(--header-offset))] md:flex-col md:justify-center md:gap-8 md:overflow-hidden">
        <div className="px-(--page-gutter) pb-8 text-center md:pb-0">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-800">
            {t.eyebrow}
          </p>
          <h2
            id="shop-by-occasion-heading"
            className="mt-1 font-sans text-2xl font-normal text-gold-600 sm:text-4xl"
          >
            {t.title}
          </h2>
        </div>

        <div
          ref={trackRef}
          className="flex flex-col gap-4 px-(--page-gutter) will-change-transform md:w-max md:flex-row md:items-center md:gap-8 md:px-(--slot-pad)"
        >
          {occasions.map((occasion, index) => {
            const isActive = index === activeIndex;
            // While pinned only the centred card is reachable by Tab:
            // focusing an off-screen card would make the browser scroll the
            // overflow-hidden viewport sideways and desync it from the page
            // scroll. Unpinned (mobile stack) every card is a normal link.
            const tabIndex = isPinned && !isActive ? -1 : undefined;

            return (
              <div
                key={occasion.id}
                className="md:flex md:w-(--slot-w) md:shrink-0 md:items-center md:justify-center"
              >
                <Link
                  href={occasion.ctaHref}
                  tabIndex={tabIndex}
                  className={`group relative block h-[clamp(26rem,120vw,32.5rem)] w-full overflow-hidden rounded-2xl transition-transform duration-700 ease-luxury focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600 md:h-[max(18rem,min(600px,calc(100vh-var(--header-offset)-12rem)))] md:w-[97%] ${
                    isActive ? "" : "md:scale-90"
                  }`}
                >
                  {occasion.imageUrl ? (
                    <Image
                      src={getShopifyImageUrl(occasion.imageUrl, OCCASION_IMAGE_WIDTH)}
                      alt={occasion.imageAlt}
                      fill
                      sizes="(min-width: 1600px) 1440px, (min-width: 768px) 90vw, 100vw"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover object-left transition-transform duration-700 ease-luxury group-hover:scale-[1.03]"
                    />
                  ) : (
                    <PlaceholderImage className="h-full w-full" label={occasion.title} />
                  )}

                  <div className="pointer-events-none absolute inset-0 flex items-end p-2.5 md:items-center md:justify-end md:p-8 lg:pr-12 rtl:md:justify-start">
                    <div
                      className={`flex min-h-[300px] w-full flex-col gap-3 rounded-md bg-gold-600/85 p-5 text-cream-50 shadow-xl backdrop-blur-[2px] transition-[opacity,transform] duration-1000 ease-luxury md:min-h-[360px] md:w-[420px] md:p-6 lg:min-h-[389px] lg:w-[487px] ${
                        isActive
                          ? ""
                          : "md:pointer-events-none md:translate-x-[150%] md:opacity-0"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* dir="ltr": a counter like "03 / 04" must not be reordered by bidi. */}
                        <p
                          dir="ltr"
                          className="font-sans text-4xl font-bold tabular-nums leading-none tracking-wide lg:text-5xl"
                        >
                          {pad(index + 1)}
                          <span className="ml-1.5 text-2xl font-medium text-cream-50/80 lg:text-3xl">
                            / {pad(occasions.length)}
                          </span>
                        </p>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-cream-50 text-brown-900 transition-colors duration-300 group-hover:bg-gold-50 lg:h-12 lg:w-12">
                          <ArrowUpRightIcon className="h-5 w-5" />
                        </span>
                      </div>

                      <div className="mt-auto flex flex-col gap-3 lg:gap-4">
                        {occasion.badgeLabel && (
                          <Chip tone="dark" className="self-start">
                            <SparkleIcon className="h-3.5 w-3.5 text-gold-50" />
                            {occasion.badgeLabel}
                          </Chip>
                        )}
                        <h3 className="font-sans text-2xl font-semibold leading-tight lg:text-[28px]">
                          {occasion.title}
                          {occasion.tagline && (
                            <>
                              <br />
                              <span className="font-normal italic text-gold-50">
                                {occasion.tagline}
                              </span>
                            </>
                          )}
                        </h3>
                        <p className="line-clamp-3 font-sans text-sm leading-relaxed text-cream-50">
                          {occasion.description}
                        </p>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-cream-50 underline-offset-4 group-hover:underline">
                          {occasion.ctaLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div
          className="hidden items-center justify-center gap-3 md:flex"
          aria-hidden
        >
          <span dir="ltr" className="font-sans text-xs font-semibold tabular-nums text-brown-900/60">
            {pad(activeIndex + 1)} / {pad(occasions.length)}
          </span>
          <div className="flex items-center gap-2">
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
    </section>
  );
}
