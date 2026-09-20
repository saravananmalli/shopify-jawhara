import Link from "next/link";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Chip from "@/components/ui/Chip";
import { CalendarIcon } from "@/components/icons";

export default function HeritageSection() {
  return (
    <section className="bg-cream-100">
      <div className="mx-auto grid max-w-8xl grid-cols-1 gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <Chip tone="deep" className="mb-3">
            <CalendarIcon className="h-3.5 w-3.5" /> Jewellers Since 1907 &bull; 118 Years of Heritage
          </Chip>
          <h2 className="font-serif text-3xl leading-tight text-gold-600 sm:text-4xl">
            From Dubai Gold Souk to Global Splendor:
            <br />
            <span className="text-gold-600 italic">
              The Arabian Bridal &amp; Bespoke Atelier.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brown-900/70">
            Founded in 1907 in Dubai&apos;s historic Gold Souk, Jawhara has adorned royal
            dynasties, emirati brides, and international collectors for over a century. Our
            Bespoke Atelier invites you to collaborate with resident master gemologists to
            craft one-of-a-kind royal bridal parures and monumental solitaires.
          </p>
          <Link
            href="/pages/bespoke-atelier"
            className="mt-6 inline-block rounded-full bg-gold-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-700"
          >
            View Collections
          </Link>
        </div>

        <div className="relative">
          <PlaceholderImage className="aspect-[4/5] w-full rounded-2xl" label="Atelier portrait" />
          <div className="absolute inset-x-6 bottom-4 rounded-xl bg-white/95 px-4 py-3 text-center shadow">
            <p className="text-xs font-semibold text-gold-700">1907 &ndash; 2025</p>
            <p className="text-xs text-brown-900/70">
              Adorning Over 4 Generations of UAE Families
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
