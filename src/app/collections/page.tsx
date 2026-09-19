import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategoryCollections } from "@/services/shopify";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";

// 2x the largest rendered width (25vw of the 1440px max-w-8xl container).
const COLLECTION_TILE_IMAGE_WIDTH = 800;

export const metadata: Metadata = {
  title: "Collections | Jawhara Jewellery",
  description:
    "Browse every Jawhara Jewellery collection — bridal, gold, diamonds, pearls, and more, straight from Dubai's historic Gold Souk.",
};

export default async function CollectionsIndexPage() {
  const collections = await getCategoryCollections({ first: 24 });

  return (
    <section className="mx-auto max-w-8xl px-4 py-10">
      <h1 className="font-serif text-3xl">Collections</h1>

      {collections.length === 0 ? (
        <p className="mt-8 text-sm text-brown-900/60">
          No collections are available right now.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group block overflow-hidden rounded-2xl bg-cream-100 ring-1 ring-gold-100"
            >
              <div className="relative aspect-square bg-cream-100">
                {collection.imageUrl && (
                  <Image
                    src={getShopifyImageUrl(collection.imageUrl, COLLECTION_TILE_IMAGE_WIDTH)}
                    alt={collection.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <p className="p-3 text-sm font-medium text-brown-900">
                {collection.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
