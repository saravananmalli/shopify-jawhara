import Image from "next/image";
import Link from "@/components/ui/Link";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Chip from "@/components/ui/Chip";
import { AwardIcon, SparkleIcon, ChevronRightIcon } from "@/components/icons";
import { ATELIER_COLLECTION_HANDLE } from "@/config/catalog";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";

// 2x the largest rendered width (50vw of the 1440px max-w-8xl container).
const ATELIER_IMAGE_WIDTH = 1600;

export default async function AtelierSection({
  image,
}: {
  image: { url: string; alt: string } | null;
}) {
  const { home } = await getDictionary(await getLocale());
  const t = home.atelier;

  return (
    <section className="bg-[#FAF8F5]">
      <div className="grid page-container grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          {image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src={getShopifyImageUrl(image.url, ATELIER_IMAGE_WIDTH)}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ) : (
            <PlaceholderImage className="aspect-[4/3] w-full rounded-2xl" label={t.photoLabel} />
          )}

          {/* Slow, gentle float — respects prefers-reduced-motion via the
              global animation-duration override in globals.css. */}
          <div className="animate-gentle-float absolute -bottom-4 start-4 end-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg sm:end-auto sm:w-80">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-100">
              <AwardIcon className="h-5 w-5 text-gold-600" />
            </span>
            <div>
              <p className="font-sans text-sm font-semibold text-brown-900">
                {t.cardTitle}
              </p>
              <p className="mt-0.5 font-sans text-xs text-brown-900/60">{t.cardText}</p>
            </div>
          </div>
        </div>

        <div>
          <Chip tone="deep" className="mb-4">
            <SparkleIcon className="h-3.5 w-3.5" /> {t.chip}
          </Chip>
          <h2 className="font-sans text-2xl leading-tight text-gold-600 sm:text-4xl">
            {t.headingLine1}
            <br />
            <span className="font-sans italic text-gold-600">{t.headingLine2}</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-brown-900/70">
            {t.body}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {t.stats.map((stat) => (
              <div key={stat.title} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-sans text-lg font-semibold text-gold-600">{stat.title}</p>
                <p className="mt-1 font-sans text-xs font-semibold text-brown-900">{stat.subtitle}</p>
                <p className="mt-1 font-sans text-[11px] leading-snug text-brown-900/60">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2 sm:gap-3">
            <Link
              href={`/collections/${ATELIER_COLLECTION_HANDLE}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gold-600 px-3 py-3 text-center font-sans text-[11px] font-bold uppercase tracking-wider text-white hover:bg-gold-700 sm:flex-none sm:gap-2 sm:px-6 sm:text-xs"
            >
              {t.exploreSolitaires} <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/collections/engagement-rings"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gold-300 px-3 py-3 text-center font-sans text-[11px] font-bold uppercase tracking-wider text-gold-600 sm:flex-none sm:gap-2 sm:px-6 sm:text-xs"
            >
              <SparkleIcon className="h-4 w-4" /> {t.engagementRings}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
