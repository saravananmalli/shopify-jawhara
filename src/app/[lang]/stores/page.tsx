import type { Metadata } from "next";
import StoreLocator from "@/components/stores/StoreLocator";
import { brandName, siteUrl } from "@/config/site";
import { getDictionary } from "@/dictionaries";
import { getStoreLocations } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";
import { localizePath } from "@/utils/locale-path";
import { localeAlternates } from "@/utils/seo";
import { serializeJsonLd } from "@/utils/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  const title = `${meta.storesTitle} | ${meta.brand}`;
  const description = meta.storesDescription;
  const alternates = localeAlternates("/stores", locale);
  const url = localizePath("/stores", locale);

  return {
    title,
    description,
    alternates,
    openGraph: { title, description, type: "website", url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function StoresPage() {
  const locale = await getLocale();
  const [stores, { stores: t }] = await Promise.all([
    getStoreLocations(locale),
    getDictionary(locale),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": stores.map((store) => ({
      "@type": "JewelryStore",
      name: store.name,
      url: `${siteUrl}${localizePath("/stores", locale)}`,
      parentOrganization: { "@type": "Organization", name: brandName, url: siteUrl },
      address: {
        "@type": "PostalAddress",
        streetAddress: store.address || undefined,
        addressRegion: store.region || undefined,
        addressCountry: store.country || undefined,
      },
      telephone: store.phone || undefined,
      hasMap: store.mapLink || undefined,
      geo: store.coordinates
        ? {
            "@type": "GeoCoordinates",
            latitude: store.coordinates.lat,
            longitude: store.coordinates.lng,
          }
        : undefined,
    })),
  };

  return (
    <>
      {stores.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
      )}

      <section className="bg-cream-100">
        <div className="mx-auto max-w-8xl px-4 py-8 sm:py-12">
          <h1 className="font-sans text-3xl leading-tight text-gold-600 sm:text-4xl">
            {t.heading}
          </h1>
          <p className="mt-3 text-base text-brown-900/70">{t.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-4 pb-16 pt-8">
        <StoreLocator stores={stores} />
      </div>
    </>
  );
}
