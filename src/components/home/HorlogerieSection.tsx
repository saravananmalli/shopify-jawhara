import Image from "next/image";
import Link from "next/link";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Chip from "@/components/ui/Chip";
import { WatchIcon, ChevronRightIcon } from "@/components/icons";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";

// 2x the largest rendered width (50vw of the 1440px max-w-8xl container).
const HORLOGERIE_IMAGE_WIDTH = 1600;

const STATS = [
  { title: "COSC", subtitle: "Certified Precision", desc: "Official Swiss Chronometer tested for utmost accuracy." },
  { title: "18K & 950", subtitle: "Precious Metals", desc: "Forged in solid 18K rose gold and pure platinum 950." },
  { title: "5 Years", subtitle: "VIP Servicing", desc: "Boutique master watchmaker servicing at The Dubai Mall." },
];

export default function HorlogerieSection({
  image,
}: {
  image: { url: string; alt: string } | null;
}) {
  return (
    <section className="bg-[#FAF8F5]">
      <div className="mx-auto grid max-w-8xl grid-cols-1 gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          {image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src={getShopifyImageUrl(image.url, HORLOGERIE_IMAGE_WIDTH)}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ) : (
            <PlaceholderImage className="aspect-[4/3] w-full rounded-2xl" label="Atelier photography" />
          )}

          {/* Slow, gentle float — respects prefers-reduced-motion via the
              global animation-duration override in globals.css. */}
          <div className="animate-gentle-float absolute -bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg sm:right-auto sm:w-80">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-100">
              <WatchIcon className="h-5 w-5 text-gold-600" />
            </span>
            <div>
              <p className="font-sans text-sm font-semibold text-brown-900">
                Swiss Certified Chronometer Atelier
              </p>
              <p className="mt-0.5 font-sans text-xs text-brown-900/60">
                COSC certified mechanical movements, 18K solid gold casings, and 5-year salon servicing.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Chip className="mb-4">
            <WatchIcon className="h-3.5 w-3.5" /> Haute Horlogerie Division
          </Chip>
          <h2 className="font-sans text-3xl leading-tight text-brown-900 sm:text-4xl">
            Swiss Precision,
            <br />
            <span className="font-sans italic text-gold-600">Crowned in Arabian Gold.</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-brown-900/70">
            Inspired by a century of connoisseurship, Jawhara Horlogerie marries Genevan
            mechanical mastery with our signature 18K gold and diamond craftsmanship. Each
            timepiece is hand-assembled in Le Locle, Switzerland and certified with a 5-year
            international warranty backed by dedicated Dubai salon servicing.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.title} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-sans text-lg font-semibold text-gold-600">{stat.title}</p>
                <p className="mt-1 font-sans text-xs font-semibold text-brown-900">{stat.subtitle}</p>
                <p className="mt-1 font-sans text-[11px] leading-snug text-brown-900/60">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/collections/horlogerie"
              className="flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-gold-700"
            >
              View Horlogerie Collection <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/pages/watch-concierge"
              className="flex items-center gap-2 rounded-full border border-gold-300 px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-gold-600"
            >
              <WatchIcon className="h-4 w-4" /> Watch Concierge
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
