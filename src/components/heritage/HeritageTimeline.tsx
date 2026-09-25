"use client";

import { useEffect, useRef, useState } from "react";
import HeritageImage from "@/components/heritage/HeritageImage";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";
import type { HeritageImageSource } from "@/config/heritage-images";

export type TimelineItem = {
  year: string;
  title: string;
  body: string;
  body2?: string;
  image: HeritageImageSource;
};

/**
 * Scroll-driven chapter list. Desktop: a sticky stage (giant year + photo)
 * crossfades while the text column scrolls past; mobile: each milestone is its
 * own year → photo → title → text block. Every milestone is real markup in an
 * ordered list, so the whole story reads without JS.
 */
export default function HeritageTimeline({
  items,
  tail = [],
}: {
  items: TimelineItem[];
  /** Extra last stops in the year index that jump to sections outside the list. */
  tail?: { year: string; targetId: string }[];
}) {
  const { goTo } = useDictionary().heritage.timeline;
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.5;
      const rows = Array.from(list.children) as HTMLElement[];
      let current = 0;
      rows.forEach((row, i) => {
        if (row.getBoundingClientRect().top <= mid) current = i;
      });
      setActive((prev) => (prev === current ? prev : current));
      const box = list.getBoundingClientRect();
      const progress = Math.min(Math.max((mid - box.top) / box.height, 0), 1);
      railRef.current?.style.setProperty("--progress", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const jump = (target: Element | null, block: ScrollLogicalPosition = "center") =>
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block,
    });

  const yearNav = (className: string) => (
    <nav aria-label={goTo.replace("{year}", "").trim()} className={className}>
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          aria-label={formatMessage(goTo, { year: item.year })}
          aria-current={i === active ? "true" : undefined}
          onClick={() => jump(listRef.current?.children[i] ?? null)}
          className={`shrink-0 border-b py-1 text-xs tracking-[0.15em] transition-colors duration-(--motion-normal) ${
            i === active ? "border-gold-600 text-gold-600" : "border-transparent text-brown-900/50 hover:text-gold-600"
          }`}
        >
          {item.year}
        </button>
      ))}
      {tail.map((stop) => (
        <button
          key={stop.year}
          type="button"
          aria-label={formatMessage(goTo, { year: stop.year })}
          onClick={() => jump(document.getElementById(stop.targetId), "start")}
          className="shrink-0 border-b border-transparent py-1 text-xs tracking-[0.15em] text-brown-900/50 transition-colors duration-(--motion-normal) hover:text-gold-600"
        >
          {stop.year}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="page-container relative lg:grid lg:grid-cols-12 lg:gap-x-16">
      {yearNav("-mx-1 flex gap-5 overflow-x-auto px-1 pb-4 pt-2 lg:hidden")}

      {/* Sticky stage — desktop only */}
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-[var(--header-h,0px)] flex h-[calc(100svh-var(--header-h,0px))] items-center gap-8">
          <div ref={railRef} aria-hidden className="her-rail relative h-3/4 w-px shrink-0 bg-gold-500/25">
            <span className="her-rail-fill absolute inset-x-0 top-0 h-full bg-gold-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div aria-hidden className="relative h-[8.5rem] overflow-hidden">
              {items.map((item, i) => (
                <span
                  key={i}
                  data-active={i === active ? "" : undefined}
                  className="her-year absolute inset-x-0 top-0 font-sans font-light text-[8rem] leading-none her-gold"
                >
                  {item.year}
                </span>
              ))}
            </div>
            <div aria-hidden className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-gold-800">
              {items.map((item, i) => (
                <div
                  key={i}
                  data-active={i === active ? "" : undefined}
                  className="her-stage-image absolute inset-0"
                >
                  <HeritageImage image={item.image} sizes="(min-width:1024px) 45vw, 0px" parallax={false} />
                </div>
              ))}
            </div>
            {yearNav("mt-6 flex flex-wrap gap-x-5 gap-y-2")}
          </div>
        </div>
      </div>

      <ol ref={listRef} className="lg:col-span-6">
        {items.map((item, i) => (
          <li
            key={i}
            data-active={i === active ? "" : undefined}
            className="her-item flex flex-col justify-center py-12 lg:min-h-[62svh] lg:py-16"
          >
            <p className="font-sans font-light text-6xl leading-none her-gold lg:text-base lg:tracking-[0.3em]">
              {item.year}
            </p>
            <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden bg-gold-800 lg:hidden">
              <HeritageImage image={item.image} sizes="(min-width:768px) 90vw, 100vw" />
            </div>
            <h3 className="mt-8 font-sans font-light text-2xl leading-snug text-gold-600 sm:text-3xl lg:mt-6 lg:text-4xl">
              {item.title}
            </h3>
            <span className="mt-6 block h-px w-14 bg-gold-500" />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-brown-900/75">{item.body}</p>
            {item.body2 && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brown-900/75">{item.body2}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
