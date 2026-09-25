import Image from "next/image";
import FooterLink from "@/components/layout/FooterLink";
import { SocialIcon } from "@/components/SocialIcons";
import { contact } from "@/config/contact";
import { SOCIAL_LINKS } from "@/config/socials";
import { getDictionary } from "@/dictionaries";
import { formatMessage } from "@/utils/i18n";
import { getLocale } from "@/utils/get-locale";
import type { Brand, NavLink } from "@/types/content";

// Enquiry mailboxes shown in the footer (no Storefront field for a segmented contact block).
const EMAILS = [
  { key: "general", address: "Contactus@jawharajewellery.ae" },
  { key: "corporate", address: "b2b@jawharajewellery.ae" },
  { key: "hr", address: "careers@jawharajewellery.ae" },
] as const;

export default async function Footer({
  brand,
  footerNav,
}: {
  brand: Brand;
  footerNav: NavLink[];
}) {
  const t = await getDictionary(await getLocale());
  const hasColumns = footerNav.some((item) => item.items.length > 0);
  // The dictionary columns (real pages and policies, same set as
  // jawharajewellery.com) are used only until the "footer" menu in Shopify
  // Admin has column-style nested items (a top-level item per column, its
  // links as sub-items).
  const columns: { title: string; links: { title: string; url: string }[] }[] = hasColumns
    ? footerNav.map((column) => ({ title: column.title, links: column.items }))
    : t.footer.columns;

  return (
    <footer>
      <div className="bg-white">
        <div className="page-container grid gap-x-10 gap-y-12 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:py-16">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="lg:col-span-2 lg:[&:nth-child(2)]:col-span-3">
              <h2 className="font-sans text-lg font-medium text-brown-900">{col.title}</h2>
              <ul className="mt-5 flex flex-col gap-3 text-[15px] text-brown-900/80">
                {col.links.map((link) => (
                  <li key={link.title}>
                    <FooterLink href={link.url}>{link.title}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-3">
            <h2 className="font-sans text-lg font-medium text-brown-900">{t.footer.contactHeading}</h2>
            <p className="mt-5 text-[15px] font-medium text-brown-900">{t.footer.support}</p>
            <ul className="mt-3 flex flex-col gap-3 text-[15px] text-brown-900/80">
              <li>
                <a dir="ltr" href={contact.phone.href} className="transition-colors hover:text-gold-600">
                  {contact.phone.display}
                </a>
              </li>
              {EMAILS.map((email) => (
                <li key={email.key}>
                  <span className="block text-[11px] uppercase tracking-widest text-brown-900/50">
                    {t.footer[email.key]}
                  </span>
                  <a dir="ltr" href={`mailto:${email.address}`} className="break-all transition-colors hover:text-gold-600">
                    {email.address}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recognition & certification */}
          <div className="flex items-center justify-center sm:col-span-2 lg:col-span-4 lg:justify-end">
            <div className="relative aspect-[631/395] w-full max-w-sm">
              <Image
                src="/jawhara-footer.png"
                alt={t.footer.badgesAlt}
                fill
                sizes="(min-width: 1024px) 384px, 90vw"
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Base bar — the brand primary */}
      <div className="bg-gold-600 text-white">
        <div className="page-container flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
          <p className="text-sm font-medium">
            {formatMessage(t.footer.copyright, {
              brand: brand.name,
              year: new Date().getFullYear(),
            })}
          </p>
          <ul className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.key}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="block p-1 transition-opacity duration-(--motion-fast) hover:opacity-75"
                >
                  <SocialIcon name={social.key} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
