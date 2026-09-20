import Link from "@/components/ui/Link";
import { AwardIcon } from "@/components/icons";
import { getDictionary } from "@/dictionaries";
import { formatMessage } from "@/utils/i18n";
import { getLocale } from "@/utils/get-locale";
import type { Brand, NavLink } from "@/types/content";

const SOCIALS = ["Instagram", "Facebook", "Snapchat", "TikTok", "YouTube", "LinkedIn", "X"];

export default async function Footer({
  brand,
  footerNav,
}: {
  brand: Brand;
  footerNav: NavLink[];
}) {
  const t = await getDictionary(await getLocale());
  const hasColumns = footerNav.some((item) => item.items.length > 0);
  // The dictionary columns are used only until the "footer" menu in Shopify
  // Admin has column-style nested items (a top-level item per column, its
  // links as sub-items).
  const columns: { title: string; links: { title: string; url: string }[] }[] = hasColumns
    ? footerNav.map((column) => ({ title: column.title, links: column.items }))
    : t.footer.columns.map((column) => ({
        title: column.title,
        links: column.links.map((title) => ({ title, url: "#" })),
      }));

  return (
    <footer className="border-t border-gold-100 bg-cream-100">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 text-gold-700">
              <AwardIcon className="h-9 w-9" />
              <span className="text-xs leading-tight">{t.footer.onlyNaturalDiamonds}</span>
            </div>
            <p className="mt-4 text-[11px] tracking-wide text-brown-900/50">
              IGI &middot; GIA &middot; IDL &middot; SGL
            </p>

            {/* Not yet Shopify-driven: no native Storefront field for a
             * segmented (General/Corporate/HR) enquiry contact block. */}
            <div className="mt-6 text-sm">
              <p className="font-semibold">{t.footer.support}</p>
              {/* dir="ltr": an address is Latin text and must not be reordered
                  by the surrounding Arabic paragraph. */}
              <p className="mt-2 text-brown-900/70">
                {t.footer.general}:{" "}
                <a dir="ltr" href="mailto:Contactus@jawharajewllery.ae" className="break-all text-gold-700 underline">
                  Contactus@jawharajewllery.ae
                </a>
              </p>
              <p className="text-brown-900/70">
                {t.footer.corporate}:{" "}
                <a dir="ltr" href="mailto:b2b@jawharajewllery.ae" className="break-all text-gold-700 underline">
                  b2b@jawharajewllery.ae
                </a>
              </p>
              <p className="text-brown-900/70">
                {t.footer.hr}:{" "}
                <a dir="ltr" href="mailto:careers@jawharajewllery.ae" className="break-all text-gold-700 underline">
                  careers@jawharajewllery.ae
                </a>
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold">{col.title}</p>
              <ul className="flex flex-col gap-2 text-sm text-brown-900/70">
                {col.links.map((link) => (
                  <li key={link.title}>
                    <Link href={link.url} className="hover:text-gold-700">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gold-100 pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sm font-medium">{t.footer.findUsOn}</span>
            <ul className="flex flex-wrap items-center gap-2">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <Link
                    href="#"
                    aria-label={s}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-600 text-[10px] font-semibold text-white"
                  >
                    {s[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-brown-900/50">
            {formatMessage(t.footer.copyright, {
              brand: brand.name,
              year: new Date().getFullYear(),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
