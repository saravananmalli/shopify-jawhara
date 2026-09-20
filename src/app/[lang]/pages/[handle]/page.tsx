import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPageView from "@/components/layout/ContentPageView";
import { getDictionary } from "@/dictionaries";
import { getPage } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";
import { localizePath } from "@/utils/locale-path";
import { localeAlternates } from "@/utils/seo";
import { pageMetadata } from "@/utils/content-page-metadata";

// Handles are chosen by the merchant in Admin, so this can't be pre-rendered
// from a fixed list; it renders on demand and Shopify data is cached.
export async function generateMetadata({ params }: PageProps<"/[lang]/pages/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const locale = await getLocale();
  const [page, { meta }] = await Promise.all([getPage(handle, locale), getDictionary(locale)]);
  if (!page) return { title: `${meta.notFoundTitle} | ${meta.brand}`, robots: { index: false } };

  const path = `/pages/${handle}`;
  return pageMetadata(page, meta.brand, localizePath(path, locale), localeAlternates(path, locale));
}

export default async function ShopifyPage({ params }: PageProps<"/[lang]/pages/[handle]">) {
  const { handle } = await params;
  const page = await getPage(handle, await getLocale());
  if (!page) notFound();

  return <ContentPageView page={page} />;
}
