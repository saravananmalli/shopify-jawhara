import type { Metadata } from "next";
import WishlistView from "@/components/ui/WishlistView";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocale());
  // Personal to this browser, so there is nothing for a search engine to index.
  return { title: `${meta.wishlistTitle} | ${meta.brand}`, robots: { index: false } };
}

export default async function WishlistPage() {
  const { wishlist: t, common } = await getDictionary(await getLocale());

  return (
    <section className="page-container py-8 sm:py-12">
      <Breadcrumb items={[{ label: common.home, href: "/" }, { label: t.title }]} />
      <h1 className="mt-6 font-sans text-2xl font-normal text-gold-600 sm:text-4xl">{t.title}</h1>
      <p className="mt-2 font-sans text-sm text-brown-900/60">{t.intro}</p>
      <WishlistView />
    </section>
  );
}
