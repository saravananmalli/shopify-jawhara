import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ContentPageView from "@/components/layout/ContentPageView";
import FaqView from "@/components/layout/FaqView";
import { FAQ_PAGE, STATIC_PAGES, STATIC_REDIRECTS, toContentPage } from "@/content/static-pages";
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
  const [shopifyPage, { meta }] = await Promise.all([getPage(handle, locale), getDictionary(locale)]);
  if (!shopifyPage && handle === "faq") {
    return pageMetadata(
      { handle, title: FAQ_PAGE.title, bodyHtml: "", seoTitle: null, seoDescription: FAQ_PAGE.description },
      meta.brand,
      localizePath("/pages/faq", locale),
      localeAlternates("/pages/faq", locale),
    );
  }
  const page = shopifyPage ?? (STATIC_PAGES[handle] ? toContentPage(handle, STATIC_PAGES[handle]) : null);
  if (!page) return { title: `${meta.notFoundTitle} | ${meta.brand}`, robots: { index: false } };

  const path = `/pages/${handle}`;
  return pageMetadata(page, meta.brand, localizePath(path, locale), localeAlternates(path, locale));
}

export default async function ShopifyPage({ params }: PageProps<"/[lang]/pages/[handle]">) {
  const { handle } = await params;
  const locale = await getLocale();
  const page = await getPage(handle, locale);
  if (page) return <ContentPageView page={page} />;

  // Not in Shopify (yet): fall back to the copy of the original site's page.
  if (handle === "faq") return <FaqView page={FAQ_PAGE} />;
  if (STATIC_PAGES[handle]) return <ContentPageView page={toContentPage(handle, STATIC_PAGES[handle])} wide />;
  if (STATIC_REDIRECTS[handle]) redirect(localizePath(STATIC_REDIRECTS[handle], locale));
  notFound();
}
