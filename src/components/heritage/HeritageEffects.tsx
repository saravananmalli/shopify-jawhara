"use client";

import { useEffect, useRef } from "react";

const COUNT_DURATION_MS = 2600;
const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The page's scroll behaviour, in one place and one rAF-throttled listener:
 * - IntersectionObserver adds `data-in` to `[data-reveal]` blocks and counts
 *   `[data-count]` numbers up;
 * - scroll progress is written as `--p` onto `[data-parallax]` (image drift),
 *   `[data-scrub]` (word-by-word light-up) and `[data-scrollp]` (hero exit),
 *   plus `--page-p` for the gold progress bar.
 * The CSS only hides or dims anything when scripting is on and motion is
 * welcome, so the page reads fully if this never runs.
 */
export default function HeritageEffects() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      if (reduce || !Number.isFinite(target)) return;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / COUNT_DURATION_MS, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.count) countUp(el);
          el.setAttribute("data-in", "");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal], [data-count]").forEach((el) => observer.observe(el));

    const bar = barRef.current;
    const setBar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar?.style.setProperty("--page-p", (max > 0 ? clamp01(window.scrollY / max) : 0).toFixed(4));
    };
    setBar();

    let frame = 0;
    let cleanup = () => {};
    if (!reduce) {
      const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
      const scrub = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"));
      const hero = Array.from(document.querySelectorAll<HTMLElement>("[data-scrollp]"));

      const update = () => {
        frame = 0;
        const vh = window.innerHeight;
        setBar();
        for (const el of parallax) {
          const r = el.parentElement!.getBoundingClientRect();
          if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue;
          el.style.setProperty("--p", clamp01((vh - r.top) / (vh + r.height)).toFixed(4));
        }
        for (const el of scrub) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          el.style.setProperty("--p", clamp01((vh * 0.88 - r.top) / (r.height + vh * 0.3)).toFixed(4));
        }
        for (const el of hero) {
          el.style.setProperty("--p", clamp01(window.scrollY / el.offsetHeight).toFixed(4));
        }
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanup = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    } else {
      const onScroll = () => setBar();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => window.removeEventListener("scroll", onScroll);
    }

    return () => {
      observer.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div ref={barRef} className="her-progress" aria-hidden>
      <span />
    </div>
  );
}
