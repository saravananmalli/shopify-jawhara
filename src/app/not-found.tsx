import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Jawhara Jewellery",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-8xl px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">404</p>
      <h1 className="mt-3 font-serif text-3xl">We couldn&rsquo;t find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-brown-900/60">
        The piece or collection you&rsquo;re looking for may have moved or is no longer available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/collections"
          className="rounded-full bg-gold-600 px-6 py-3 text-sm font-medium text-white transition-colors duration-(--motion-fast) hover:bg-gold-700"
        >
          Browse collections
        </Link>
        <Link
          href="/"
          className="rounded-full border border-gold-600 px-6 py-3 text-sm font-medium text-gold-700 transition-colors duration-(--motion-fast) hover:bg-gold-50"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
