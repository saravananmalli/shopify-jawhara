import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocale());
  return { title: `${meta.notFoundTitle} | ${meta.brand}`, robots: { index: false } };
}

export default async function NotFound() {
  const { errors: t } = await getDictionary(await getLocale());

  return (
    <section className="page-container py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">404</p>
      <h1 className="mt-3 font-serif text-3xl">{t.notFoundTitle}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-brown-900/60">{t.notFoundBody}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/collections" variant="primary" className="px-6 py-3 text-sm font-medium">
          {t.browseCollections}
        </Button>
        <Button href="/" variant="secondary" className="px-6 py-3 text-sm font-medium">
          {t.backHome}
        </Button>
      </div>
    </section>
  );
}
