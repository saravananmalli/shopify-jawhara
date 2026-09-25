import Breadcrumb from "@/components/ui/Breadcrumb";
import FaqTabs from "@/components/layout/FaqTabs";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { serializeJsonLd } from "@/utils/json-ld";
import type { StaticFaqPage } from "@/content/static-pages";

const plain = (text: string) => text.replaceAll("**", "");

/** Question-and-answer page: category tabs over collapsible answers. */
export default async function FaqView({ page }: { page: StaticFaqPage }) {
  const { common } = await getDictionary(await getLocale());

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a.map(plain).join(" ") },
      })),
    ),
  };

  return (
    <article className="page-container py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <Breadcrumb items={[{ label: common.home, href: "/" }, { label: page.title }]} />
      <h1 dir="auto" className="mt-6 font-sans text-2xl font-normal text-gold-600 sm:text-4xl">{page.title}</h1>

      <div dir="auto">
        <FaqTabs groups={page.groups} />
      </div>
    </article>
  );
}
