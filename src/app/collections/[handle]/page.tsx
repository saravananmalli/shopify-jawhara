import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { getCollectionByHandle } from "@/services/shopify";

const PRODUCTS_PER_PAGE = 24;

type PageParams = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle, { first: PRODUCTS_PER_PAGE });

  if (!collection) {
    return { title: "Collection not found | Jawhara Jewellery" };
  }

  return {
    title: `${collection.title} | Jawhara Jewellery`,
    description:
      collection.description || `Shop the ${collection.title} collection at Jawhara Jewellery.`,
  };
}

export default async function CollectionPage({ params }: PageParams) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle, { first: PRODUCTS_PER_PAGE });

  if (!collection) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    ...(collection.description && { description: collection.description }),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/products/${product.handle}`,
      })),
    },
  };

  return (
    <section className="mx-auto max-w-8xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <h1 className="font-serif text-3xl">{collection.title}</h1>
      {collection.description && (
        <p className="mt-2 max-w-2xl text-sm text-brown-900/60">
          {collection.description}
        </p>
      )}

      {collection.products.length === 0 ? (
        <p className="mt-10 text-center text-sm text-brown-900/60">
          No products in this collection yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
