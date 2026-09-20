"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import { getShopifyImageUrl, isUntrustedRemoteImage, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { HeroBanner } from "@/types/content";

// Full-bleed 100vw hero; 1920 is the largest width next.config.ts serves.
const HERO_IMAGE_WIDTH = 1920;

/** Used only until a "hero_banner" metaobject entry exists in Shopify Admin. */
const FALLBACK_SLIDES: HeroBanner[] = [
  {
    id: "fallback-al-nakhla",
    imageUrl: "/brand/hero-2.webp",
    imageAlt: "Al Nakhla — A Legacy That Lives Forever",
    hasBakedInText: true,
    eyebrow: "Al Nakhla",
    arabicLine: null,
    englishLine: "A LEGACY THAT LIVES FOREVER.",
    badgeLabel: "SHOP THE COLLECTION",
    badgeValue: "AL NAKHLA",
    href: "/collections/al-nakhla",
  },
];

function SlideContent({ slide, priority }: { slide: HeroBanner; priority: boolean }) {
  const { hero } = useDictionary().home;

  return (
    <>
      {slide.imageUrl ? (
        <Image
          src={getShopifyImageUrl(slide.imageUrl, HERO_IMAGE_WIDTH)}
          alt={slide.imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          unoptimized={isUntrustedRemoteImage(slide.imageUrl)}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover"
        />
      ) : (
        <PlaceholderImage label={hero.campaignPhoto} className="absolute inset-0 h-full w-full" />
      )}

      {slide.hasBakedInText ? (
        // Photo already carries its own headline/branding — only add a CTA
        // pill if a badge was actually filled in, so we don't draw an empty
        // box on top of a self-contained image.
        slide.badgeLabel && (
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <Link
              href={slide.href}
              className="inline-block rounded-lg bg-white/90 px-5 py-3 text-brown-900 shadow-lg backdrop-blur-sm"
            >
              <span className="block text-[10px] uppercase tracking-wide text-brown-900/60">
                {slide.badgeLabel}
              </span>
              <span className="block text-xl font-semibold text-gold-700">
                {slide.badgeValue}
              </span>
            </Link>
          </div>
        )
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10">
          {slide.eyebrow && (
            <span className="font-serif text-5xl italic text-gold-700 drop-shadow-sm sm:text-6xl">
              {slide.eyebrow}
            </span>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-1 block text-xs uppercase tracking-widest text-maroon-500">
                {hero.onlyNaturalDiamonds}
              </span>
              {slide.arabicLine && (
                <p dir="rtl" className="font-serif text-lg text-brown-900">
                  {slide.arabicLine}
                </p>
              )}
              {slide.englishLine && (
                <p className="text-sm font-medium tracking-[0.2em] text-brown-900/80">
                  {slide.englishLine}
                </p>
              )}
            </div>
            {slide.badgeLabel && (
              <Link
                href={slide.href}
                className="rounded-lg bg-maroon-500 px-5 py-3 text-white shadow-lg"
              >
                <span className="block text-[10px] uppercase tracking-wide opacity-80">
                  {slide.badgeLabel}
                </span>
                <span className="block text-xl font-semibold">{slide.badgeValue}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const AUTO_ROTATE_INTERVAL_MS = 5000;
// Mount the next slide's photo this long after the current one, so it is ready
// before the rotation but never competes with the first slide (the LCP image).
const PRELOAD_NEXT_DELAY_MS = 2000;

export default function Hero({ banners }: { banners: HeroBanner[] }) {
  const { hero } = useDictionary().home;
  const slides = banners.length > 0 ? banners : FALLBACK_SLIDES;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Slides whose <Image> is mounted. Rendering every slide up front would
  // download all of their large photos at load even though only one shows.
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));

  const go = (delta: number) =>
    setIndex((prev) => (prev + delta + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length, isPaused]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const next = (index + 1) % slides.length;
    const id = setTimeout(
      () => setMounted((prev) => (prev.has(next) ? prev : new Set(prev).add(next))),
      PRELOAD_NEXT_DELAY_MS,
    );
    return () => clearTimeout(id);
  }, [index, slides.length]);

  return (
    <section
      className="relative h-[420px] w-full overflow-hidden sm:h-[600px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => {
        if (i !== index && !mounted.has(i)) return null;
        return (
          <div
            key={slide.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-luxury ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <SlideContent slide={slide} priority={i === 0} />
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label={hero.prev}
            className="absolute start-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brown-900 hover:bg-white"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label={hero.next}
            className="absolute end-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brown-900 hover:bg-white"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 start-1/2 z-10 flex -translate-x-1/2 gap-2 rtl:translate-x-1/2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={formatMessage(hero.goTo, { n: i + 1 })}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full shadow-sm transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
