import Breadcrumb from "@/components/ui/Breadcrumb";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { sanitizeRichText } from "@/utils/sanitize-html";
import type { ContentPage } from "@/types/content";

/** Shell for merchant-authored pages and policies: breadcrumb, H1, styled rich text.
 * `wide` drops the reading-width cap so the text spans the full page width. */
export default async function ContentPageView({ page, wide = false }: { page: ContentPage; wide?: boolean }) {
  const { common } = await getDictionary(await getLocale());

  return (
    <article className="page-container py-8 sm:py-12">
      <Breadcrumb items={[{ label: common.home, href: "/" }, { label: page.title }]} />
      <h1 dir="auto" className="mt-6 font-sans text-2xl font-normal text-gold-600 sm:text-4xl">
        {page.title}
      </h1>
      {/* dir="auto": the merchant's text may be in either script. */}
      <div
        dir="auto"
        className={`rich-text mt-6 ${
          wide
            ? ""
            : "max-w-3xl"
        }`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.bodyHtml) }}
      />
    </article>
  );
}
