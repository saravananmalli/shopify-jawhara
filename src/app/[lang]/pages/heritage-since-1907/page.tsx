import type { Metadata } from "next";
import HeritageEffects from "@/components/heritage/HeritageEffects";
import Ornament from "@/components/heritage/Ornament";
import ScrubText from "@/components/heritage/ScrubText";
import SplitText from "@/components/heritage/SplitText";
import HeritageImage from "@/components/heritage/HeritageImage";
import HeritageTimeline, { type TimelineItem } from "@/components/heritage/HeritageTimeline";
import "@/components/heritage/heritage.css";
import Button from "@/components/ui/Button";
import { brandName, siteUrl } from "@/config/site";
import { heritageImages } from "@/config/heritage-images";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { serializeJsonLd } from "@/utils/json-ld";
import { localizePath } from "@/utils/locale-path";
import { localeAlternates } from "@/utils/seo";

const PATH = "/pages/heritage-since-1907";
// The two milestones that get their own full-bleed treatment; the rest run
// through the scroll-driven timeline.
const FEATURE_YEAR = "2014";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { heritage, meta } = await getDictionary(locale);
  const title = `${heritage.meta.title} | ${meta.brand}`;
  const description = heritage.meta.description;
  const url = localizePath(PATH, locale);

  return {
    title,
    description,
    alternates: localeAlternates(PATH, locale),
    openGraph: { title, description, type: "website", url },
    twitter: { card: "summary_large_image", title, description },
  };
}

const eyebrow = "text-xs font-medium uppercase tracking-[0.3em]";
const h2 = "font-sans font-light text-4xl leading-tight sm:text-5xl lg:text-6xl";
const body = "text-base leading-relaxed sm:text-lg";

export default async function HeritagePage() {
  const locale = await getLocale();
  const { heritage: h } = await getDictionary(locale);

  const milestones: TimelineItem[] = h.timeline.milestones.map((m, i) => ({
    ...m,
    image: heritageImages.timeline[i] ?? null,
  }));
  const featureIndex = milestones.findIndex((m) => m.year === FEATURE_YEAR);
  const feature = milestones[featureIndex];
  const finale = milestones[milestones.length - 1];
  const before = milestones.slice(0, featureIndex);
  const after = milestones.slice(featureIndex + 1, -1);
  const featureImage = feature.image;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: h.meta.title,
    description: h.meta.description,
    url: `${siteUrl}${localizePath(PATH, locale)}`,
    about: { "@type": "Organization", name: brandName, url: siteUrl, foundingDate: "1907" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <HeritageEffects />

      {/* 1 — Hero */}
      <section data-scrollp className="relative isolate flex min-h-[calc(100svh-var(--header-h,0px))] items-end overflow-hidden bg-gold-800 text-cream-50">
        <div className="her-hero-image absolute inset-0 -z-10 saturate-[0.9]">
          <HeritageImage image={heritageImages.hero} sizes="100vw" priority />
        </div>
        {/* Two quiet scrims instead of one heavy wash: a floor that rises from
            the bottom, and a soft start-edge shade behind the copy. The top of
            the photo stays untouched. */}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-gold-900/85 via-gold-900/25 via-30% to-transparent to-55%" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-gold-900/85 via-gold-900/55 via-40% to-transparent to-75% rtl:bg-linear-to-l" />
        <div aria-hidden className="pointer-events-none absolute inset-[clamp(0.75rem,1.6vw,1.5rem)] -z-10 border border-cream-50/20" />

        <div className="page-container her-hero-exit pb-10 pt-40 sm:pb-14 lg:pb-16">
          <div className="flex items-center gap-4" style={{ "--d": "2200ms" } as React.CSSProperties}>
            <span className="her-hero-item block h-px w-12 bg-gold-50" style={{ "--d": "2200ms" } as React.CSSProperties} aria-hidden />
            <p className={`her-hero-item ${eyebrow} text-gold-50`} style={{ "--d": "2200ms" } as React.CSSProperties}>
              {h.hero.eyebrow}
            </p>
          </div>
          <SplitText
            as="h1"
            hero
            text={h.hero.heading}
            className="mt-6 max-w-3xl font-sans text-4xl font-light leading-[1.12] [text-shadow:0_2px_30px_rgb(0_0_0/0.35)] sm:text-5xl lg:text-6xl"
          />
          <p
            className="her-hero-item mt-7 max-w-xl text-base leading-[1.8] text-cream-50/90 [text-shadow:0_1px_18px_rgb(0_0_0/0.4)] sm:text-lg"
            style={{ "--d": "3500ms" } as React.CSSProperties}
          >
            {h.hero.description}
          </p>

          <div
            className="her-hero-item mt-12 flex items-center justify-between gap-6 border-t border-cream-50/25 pt-6 lg:mt-16"
            style={{ "--d": "4200ms" } as React.CSSProperties}
          >
            <a
              href="#beginning"
              className="inline-flex items-center gap-4 text-cream-50 transition-opacity duration-(--motion-normal) hover:opacity-80"
            >
              <span className="her-scroll-line block h-10 w-px bg-cream-50" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-[0.3em] sm:text-sm">{h.hero.scroll}</span>
            </a>
            <span className="hidden text-xs uppercase tracking-[0.3em] text-cream-50/70 sm:block" dir="ltr">
              {h.closing.years}
            </span>
          </div>
        </div>
      </section>

      {/* 2 — 1907, The Beginning */}
      <section id="beginning" className="bg-cream-50 py-20 lg:py-28">
        <div className="page-container flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="order-1 flex gap-6 lg:col-span-3 lg:self-start">
            <div>
              <p className="font-sans font-light text-7xl leading-none her-gold sm:text-8xl lg:text-7xl xl:text-8xl" data-reveal>
                {h.beginning.year}
              </p>
              <p className={`mt-4 text-gold-800 ${eyebrow}`} data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
                {h.beginning.label}
              </p>
            </div>
            <span className="hidden h-full min-h-40 w-px bg-gold-500/60 lg:block" data-reveal="line" aria-hidden />
          </div>

          <div className="order-3 lg:order-2 lg:col-span-5 lg:self-center">
            <SplitText text={h.beginning.heading} className={`${h2} text-gold-600`} />
            <p className={`mt-8 text-brown-900/80 ${body}`} data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
              {h.beginning.body}
            </p>
            <p className={`mt-5 text-brown-900/70 ${body}`} data-reveal style={{ "--d": "350ms" } as React.CSSProperties}>
              {h.beginning.body2}
            </p>
          </div>

          <div className="order-2 lg:order-3 lg:col-span-4">
            <div className="her-frame relative aspect-[3/4] w-full overflow-hidden bg-gold-800 lg:aspect-[4/5]" data-reveal="clip">
              <HeritageImage image={heritageImages.beginning} sizes="(min-width:1024px) 30vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Expansion */}
      <section className="bg-brown-900 py-24 text-cream-50 lg:py-40">
        <div className="page-container">
          <div className="her-frame relative aspect-[4/3] w-full overflow-hidden bg-gold-800 sm:aspect-[16/9]" data-reveal="clip">
            <HeritageImage image={heritageImages.expansion} sizes="(min-width:1440px) 1360px, 100vw" />
          </div>
          <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <p className={`text-gold-300 ${eyebrow}`} data-reveal>{h.expansion.eyebrow}</p>
              <SplitText text={h.expansion.heading} className={`mt-5 text-gold-50 ${h2}`} delay={150} />
            </div>
            <div className={`space-y-6 text-cream-50/75 lg:col-span-6 lg:col-start-7 ${body}`}>
              {[h.expansion.body, h.expansion.body2, h.expansion.body3].map((p, i) => (
                <p key={i} data-reveal style={{ "--d": `${i * 150}ms` } as React.CSSProperties}>{p}</p>
              ))}
            </div>
          </div>
          <Ornament className="mt-20 !justify-start text-gold-300 lg:mt-32" />
          <ScrubText
            text={h.expansion.statement}
            className="mt-10 max-w-5xl font-sans font-light text-3xl italic leading-tight text-gold-300 sm:text-5xl lg:text-6xl"
          />
        </div>
      </section>

      {/* 4 — Heritage statement */}
      <section className="bg-cream-50 py-32 text-center lg:py-56">
        <div className="page-container">
          <span className="mx-auto mb-14 block h-16 w-px bg-gold-500" data-reveal="line" aria-hidden />
          <h2 className="mx-auto max-w-5xl font-sans font-light text-4xl leading-tight text-gold-600 sm:text-5xl lg:text-7xl" data-reveal>
            {h.statement.heading.split(h.statement.emphasis).flatMap((part, i, all) =>
              i < all.length - 1
                ? [part, <span key={i} data-reveal="track" className="text-gold-800">{h.statement.emphasis}</span>]
                : [part]
            )}
          </h2>
          <Ornament className="mt-14" />
          <ScrubText text={h.statement.body} className={`mx-auto mt-14 max-w-2xl text-brown-900 ${body}`} />
          <ScrubText text={h.statement.body2} className={`mx-auto mt-6 max-w-2xl text-brown-900 ${body}`} />
        </div>
      </section>

      {/* 5 — Heritage meets modernity */}
      <section className="bg-cream-100 py-24 lg:py-40">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
            <SplitText text={h.modern.heading} className={`text-gold-600 lg:col-span-6 ${h2}`} />
            <div className={`space-y-5 text-brown-900/75 lg:col-span-5 lg:col-start-8 ${body}`}>
              <p data-reveal>{h.modern.body}</p>
              <p data-reveal style={{ "--d": "150ms" } as React.CSSProperties}>{h.modern.body2}</p>
            </div>
          </div>
          <ul className="mt-16 grid gap-14 md:grid-cols-3 md:gap-8 lg:mt-24 lg:gap-12">
            {h.modern.items.map((item, i) => {
              const image = [heritageImages.tradition, heritageImages.culture, heritageImages.contemporary][i] ?? null;
              return (
                <li key={item.label} className={i === 1 ? "md:mt-20" : i === 2 ? "md:mt-40" : ""}>
                  <div className="her-frame relative aspect-[3/4] w-full overflow-hidden bg-gold-800" data-reveal="clip">
                    <HeritageImage image={image} sizes="(min-width:768px) 30vw, 100vw" />
                  </div>
                  <p className={`mt-6 text-gold-800 ${eyebrow}`} data-reveal>{item.label}</p>
                  <h3 className="mt-3 font-sans font-light text-2xl leading-snug text-gold-600 sm:text-3xl" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
                    {item.title}
                  </h3>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 6 — Fairuz */}
      <section className="relative isolate flex min-h-[85svh] items-end overflow-hidden bg-gold-800 text-cream-50">
        <div className="absolute inset-0 -z-10">
          <HeritageImage image={heritageImages.fairuz} sizes="100vw" />
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-gold-900/85 via-gold-900/40 to-transparent" />
        <div className="page-container py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className={`text-gold-50 ${eyebrow}`} data-reveal>{h.fairuz.eyebrow}</p>
            <SplitText text={h.fairuz.heading} className={`mt-5 ${h2}`} delay={150} />
            <span className="mt-8 block h-px w-16 bg-gold-300" aria-hidden />
            <p className={`mt-8 text-cream-50/85 ${body}`} data-reveal>{h.fairuz.body}</p>
            <p className={`mt-4 text-cream-50/70 ${body}`} data-reveal>{h.fairuz.body2}</p>
          </div>
        </div>
      </section>

      {/* 7 — A Journey Through Time */}
      <section className="bg-cream-100">
        <div className="page-container pb-4 pt-24 text-center lg:pt-40">
          <p className={`text-gold-800 ${eyebrow}`} data-reveal>{h.timeline.eyebrow}</p>
          <SplitText text={h.timeline.heading} className={`mt-5 text-gold-600 ${h2}`} delay={150} />
          <Ornament className="mt-10" />
          <a
            href="#heritage-stats-section"
            className="mt-8 inline-block text-xs uppercase tracking-[0.25em] text-brown-900/60 underline-offset-8 transition-colors duration-(--motion-normal) hover:text-gold-600 hover:underline"
          >
            {h.timeline.skip}
          </a>
        </div>

        <HeritageTimeline items={before} tail={[{ year: feature.year, targetId: "heritage-feature" }]} />

        {/* 2014 — the flagship brand arrives */}
        <div id="heritage-feature" className="scroll-mt-[var(--header-h,0px)] relative isolate my-16 overflow-hidden bg-gold-800 py-24 text-cream-50 lg:my-24 lg:py-40">
          <div className="page-container grid items-center gap-12 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-6">
              <p className="font-sans font-light text-8xl leading-none her-gold-dark sm:text-9xl" data-reveal>{feature.year}</p>
              <h3 className="mt-8 font-sans font-light text-3xl leading-snug text-gold-50 sm:text-5xl" data-reveal style={{ "--d": "150ms" } as React.CSSProperties}>
                {feature.title}
              </h3>
              <span className="mt-8 block h-px w-16 bg-gold-300" aria-hidden />
              <p className={`mt-8 max-w-xl text-cream-50/80 ${body}`} data-reveal>{feature.body}</p>
              {feature.body2 && <p className={`mt-5 max-w-xl text-cream-50/65 ${body}`} data-reveal>{feature.body2}</p>}
            </div>
            <div className="her-frame relative aspect-[4/5] w-full overflow-hidden lg:col-span-6" data-reveal="clip">
              <HeritageImage image={featureImage} sizes="(min-width:1024px) 45vw, 100vw" />
            </div>
          </div>
        </div>

        <HeritageTimeline
          items={after}
          tail={[{ year: finale.year, targetId: "heritage-stats-section" }]}
        />
      </section>

      {/* 2024 — climax */}
      <section id="heritage-stats-section" className="scroll-mt-[var(--header-h,0px)] bg-gold-800 py-28 text-center text-cream-50 lg:py-44" aria-labelledby="heritage-stats">
        <div className="page-container">
          <p className={`text-gold-300 ${eyebrow}`} data-reveal>{finale.year}</p>
          <h3 className="mx-auto mt-5 max-w-3xl font-sans font-light text-2xl text-cream-50/85 sm:text-3xl" data-reveal>
            {finale.title}
          </h3>
          <div className="mt-16 grid gap-16 sm:grid-cols-2 sm:gap-8" dir="ltr">
            {[
              { value: h.stats.stores, label: h.stats.storesLabel },
              { value: h.stats.countries, label: h.stats.countriesLabel },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-sans font-light text-8xl leading-none her-gold-dark sm:text-9xl lg:text-[12rem]" data-count={stat.value}>
                  {stat.value}
                </p>
                <p className={`mt-6 text-cream-50/70 ${eyebrow}`} dir="auto">{stat.label}</p>
              </div>
            ))}
          </div>
          <span className="mx-auto mt-20 block h-16 w-px bg-gold-300/70" data-reveal="line" aria-hidden />
          <h2 id="heritage-stats" className={`mt-12 text-gold-50 ${h2}`} data-reveal>{h.stats.heading}</h2>
          <p className={`mx-auto mt-8 max-w-2xl text-cream-50/75 ${body}`} data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
            {h.stats.body}
          </p>
        </div>
      </section>

      {/* 8 — Closing */}
      <section id="heritage-closing" className="scroll-mt-[var(--header-h,0px)] relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-gold-800 text-center text-cream-50">
        <div className="absolute inset-0 -z-10" data-reveal="zoom">
          <HeritageImage image={heritageImages.closing} sizes="100vw" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gold-900/65" />
        <div className="page-container py-28">
          <p className={`mb-6 text-gold-50 ${eyebrow}`} data-reveal dir="ltr">{h.closing.years}</p>
          <SplitText text={h.closing.heading} className={h2} />
          <p className={`mx-auto mt-8 max-w-2xl text-cream-50/80 ${body}`} data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
            {h.closing.body}
          </p>
          <Ornament className="mt-20 text-gold-300" />
          <p className="mt-10 font-sans font-light text-4xl uppercase tracking-[0.12em] her-gold-dark sm:text-6xl lg:text-7xl" data-reveal>
            {h.closing.large}
          </p>
          <p className={`mt-6 text-cream-50/70 ${eyebrow}`}>{h.closing.small}</p>
          <Button href="/collections" variant="primary" className="mt-14 px-8 py-3.5 text-sm font-medium">
            {h.closing.cta}
          </Button>
        </div>
      </section>
    </>
  );
}
