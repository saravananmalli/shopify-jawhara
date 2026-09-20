import type { Metadata } from "next";
import StoreLocator from "@/components/stores/StoreLocator";
import { brandName, siteUrl } from "@/config/site";
import { getStoreLocations } from "@/services/shopify";
import { serializeJsonLd } from "@/utils/json-ld";

const title = `Our Stores | ${brandName}`;
const description =
  "Visit a Jawhara Jewellery store near you — find addresses, opening hours, phone numbers and directions across the UAE and the GCC.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stores" },
  openGraph: { title, description, type: "website", url: "/stores" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function StoresPage() {
  const stores = await getStoreLocations();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": stores.map((store) => ({
      "@type": "JewelryStore",
      name: store.name,
      url: `${siteUrl}/stores`,
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
            Find a Jawhara Store Near You
          </h1>
          <p className="mt-3 text-base text-brown-900/70">
            Visit us in person to explore our full collection and get expert advice.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-4 pb-16 pt-8">
        <StoreLocator stores={stores} />
      </div>
    </>
  );
}
