import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPageView from "@/components/layout/ContentPageView";
import { getDictionary } from "@/dictionaries";
import { getShopPolicy, POLICY_HANDLES, type PolicyHandle } from "@/services/shopify";
import { getLocale } from "@/utils/get-locale";
import { localizePath } from "@/utils/locale-path";
import { localeAlternates } from "@/utils/seo";
import { pageMetadata } from "@/utils/content-page-metadata";

function isPolicyHandle(handle: string): handle is PolicyHandle {
  return (POLICY_HANDLES as readonly string[]).includes(handle);
}

export async function generateMetadata({ params }: PageProps<"/[lang]/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  const page = isPolicyHandle(handle) ? await getShopPolicy(handle, locale) : null;
  if (!page) return { title: `${meta.notFoundTitle} | ${meta.brand}`, robots: { index: false } };

  const path = `/policies/${handle}`;
  return pageMetadata(page, meta.brand, localizePath(path, locale), localeAlternates(path, locale));
}

export default async function ShopifyPolicyPage({ params }: PageProps<"/[lang]/policies/[handle]">) {
  const { handle } = await params;
  // Only the four policies Shopify exposes; anything else is a plain 404.
  if (!isPolicyHandle(handle)) notFound();
  const page = await getShopPolicy(handle, await getLocale());
  if (!page) notFound();

  return <ContentPageView page={page} />;
}
