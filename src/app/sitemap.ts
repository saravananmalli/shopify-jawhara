import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getSitemapEntries } from "@/services/shopify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, collections } = await getSitemapEntries();
  const toDate = (updatedAt: string | null) => (updatedAt ? new Date(updatedAt) : undefined);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/stores`, changeFrequency: "monthly", priority: 0.5 },
    ...collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.handle}`,
      lastModified: toDate(collection.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.handle}`,
      lastModified: toDate(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
