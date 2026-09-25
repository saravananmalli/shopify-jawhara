import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ArrowUpRightIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import Link from "@/components/ui/Link";
import SectionHeading from "@/components/ui/SectionHeading";
import { contact } from "@/config/contact";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";
import { localizePath } from "@/utils/locale-path";
import { localeAlternates } from "@/utils/seo";

const PATH = "/customer-service";

/** Destinations, in the same order as the dictionary lists. */
const TOPIC_LINKS = [
  "/policies/shipping-policy",
  "/policies/terms-of-service",
  "/policies/privacy-policy",
  "/pages/faq",
  "/stores",
  "/pages/heritage-since-1907",
];


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { customerService, meta } = await getDictionary(locale);
  const title = `${customerService.meta.title} | ${meta.brand}`;
  const description = customerService.meta.description;
  return {
    title,
    description,
    alternates: localeAlternates(PATH, locale),
    openGraph: { title, description, type: "website", url: localizePath(PATH, locale) },
    twitter: { card: "summary_large_image", title, description },
  };
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M3.5 20.5 5 16A8.5 8.5 0 1 1 8 19z" strokeLinejoin="round" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z" strokeLinejoin="round" />
    </svg>
  );
}

export default async function CustomerServicePage() {
  const locale = await getLocale();
  const d = await getDictionary(locale);
  const { customerService: t, common, footer } = d;

  const channels: { icon: ReactNode; href: string; value: string; ltr: boolean; external: boolean }[] = [
    { icon: <PhoneIcon className="h-7 w-7" />, href: contact.phone.href, value: contact.phone.display, ltr: true, external: true },
    { icon: <WhatsAppIcon className="h-7 w-7" />, href: contact.whatsapp.href, value: contact.whatsapp.display, ltr: true, external: true },
    { icon: <MailIcon className="h-7 w-7" />, href: `mailto:${contact.serviceEmail}`, value: contact.serviceEmail, ltr: true, external: true },
    { icon: <MapPinIcon className="h-7 w-7" />, href: "/stores", value: contact.headOffice[locale], ltr: false, external: false },
  ];

  return (
    <>
      {/* Header — same compact pattern as Stores and the content pages. */}
      <section className="bg-cream-100">
        <div className="page-container py-8 sm:py-12">
          <Breadcrumb items={[{ label: common.home, href: "/" }, { label: t.hero.heading }]} />
          <h1 className="mt-5 font-sans text-3xl leading-tight text-gold-600 sm:text-4xl">{t.hero.heading}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-brown-900/70">{t.hero.body}</p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="page-container pb-12 pt-10 sm:pb-16 sm:pt-12" aria-labelledby="cs-contact">
        <SectionHeading id="cs-contact" eyebrow={t.contact.eyebrow} title={t.contact.heading} />
        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-gold-100 bg-gold-100 sm:grid-cols-2 lg:grid-cols-4">
          {t.contact.items.map((item, i) => {
            const channel = channels[i];
            const inner = (
              <>
                <span className="text-gold-600">{channel.icon}</span>
                <h3 className="mt-4 font-sans text-base font-semibold text-brown-900">{item.title}</h3>
                <p className="mt-1 break-words font-sans text-[13px] font-medium text-gold-700" dir={channel.ltr ? "ltr" : undefined}>
                  {channel.value}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brown-900/65">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-600 transition-colors duration-(--motion-fast) group-hover:text-gold-800">
                  {item.cta}
                  <ArrowUpRightIcon className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </span>
              </>
            );
            const cls = "group flex h-full flex-col bg-white p-5 transition-colors duration-(--motion-fast) hover:bg-cream-50 sm:p-6";
            return (
              <li key={item.title}>
                {channel.external ? (
                  <a href={channel.href} className={cls}>{inner}</a>
                ) : (
                  <Link href={channel.href} className={cls}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 space-y-1 text-sm text-brown-900/60">
          <p>{footer.support}</p>
          <p>
            {t.contact.corporate}:{" "}
            <a dir="ltr" href={`mailto:${contact.corporateEmail}`} className="text-gold-700 underline underline-offset-4">
              {contact.corporateEmail}
            </a>
          </p>
        </div>
      </section>

      {/* Help topics */}
      <section className="bg-cream-100" aria-labelledby="cs-topics">
        <div className="page-container py-12 sm:py-16">
          <SectionHeading id="cs-topics" eyebrow={t.topics.eyebrow} title={t.topics.heading} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.topics.items.map((item, i) => (
              <li key={item.title}>
                <Link
                  href={TOPIC_LINKS[i]}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-gold-100 bg-white p-5 transition-colors duration-(--motion-fast) hover:border-gold-300"
                >
                  <span className="pt-0.5 font-sans text-xs font-semibold tracking-widest text-gold-600" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-sans text-base font-semibold text-brown-900 group-hover:text-gold-600">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-brown-900/65">{item.body}</span>
                  </span>
                  <ArrowUpRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing band */}
      <section className="bg-gold-600 text-white">
        <div className="page-container flex flex-col gap-6 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-sans text-2xl font-normal text-white sm:text-3xl">{t.band.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">{t.band.body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Button href={`mailto:${contact.serviceEmail}`} variant="neutral-filled" className="px-6 py-3 text-sm font-medium text-gold-700">
              {t.band.cta}
            </Button>
            <Link
              href="/stores"
              className="border-b border-white/70 pb-0.5 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80"
            >
              {t.band.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
