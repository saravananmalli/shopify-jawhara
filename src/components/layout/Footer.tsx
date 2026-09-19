import Link from "next/link";
import { AwardIcon } from "@/components/icons";
import type { Brand, NavLink } from "@/types/content";

/** Used only until the "footer" menu in Shopify Admin has column-style
 * nested items (a top-level item per column, its links as sub-items). */
const FALLBACK_COLUMNS: NavLink[] = [
  {
    title: "Know Your Jewellery",
    url: "#",
    items: [
      { title: "Diamond Guide", url: "#", items: [] },
      { title: "Jewellery Guide", url: "#", items: [] },
      { title: "Gemstone Guide", url: "#", items: [] },
      { title: "Gold Rate", url: "#", items: [] },
    ],
  },
  {
    title: "Jawhara Advantage",
    url: "#",
    items: [
      { title: "Free Shipping", url: "#", items: [] },
      { title: "15 days return", url: "#", items: [] },
      { title: "About Us", url: "#", items: [] },
      { title: "Our Designs", url: "#", items: [] },
      { title: "Sustainability", url: "#", items: [] },
      { title: "Certificate", url: "#", items: [] },
      { title: "Blog", url: "#", items: [] },
      { title: "Awards", url: "#", items: [] },
    ],
  },
  {
    title: "Customer Service",
    url: "#",
    items: [
      { title: "Privacy Policy", url: "#", items: [] },
      { title: "Return Policy", url: "#", items: [] },
      { title: "Order Status", url: "#", items: [] },
      { title: "Terms and Conditions", url: "#", items: [] },
      { title: "Faq", url: "#", items: [] },
    ],
  },
  {
    title: "About Us",
    url: "#",
    items: [
      { title: "Our Story", url: "#", items: [] },
      { title: "Press", url: "#", items: [] },
      { title: "Blog", url: "#", items: [] },
      { title: "Careers", url: "#", items: [] },
    ],
  },
];

const SOCIALS = ["Instagram", "Facebook", "Snapchat", "TikTok", "YouTube", "LinkedIn", "X"];

export default function Footer({
  brand,
  footerNav,
}: {
  brand: Brand;
  footerNav: NavLink[];
}) {
  const hasColumns = footerNav.some((item) => item.items.length > 0);
  const columns = hasColumns ? footerNav : FALLBACK_COLUMNS;

  return (
    <footer className="border-t border-gold-100 bg-cream-100">
      <div className="mx-auto max-w-8xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 text-gold-700">
              <AwardIcon className="h-9 w-9" />
              <span className="text-xs leading-tight">
                Only Natural
                <br />
                Diamonds
              </span>
            </div>
            <p className="mt-4 text-[11px] tracking-wide text-brown-900/50">
              IGI &middot; GIA &middot; IDL &middot; SGL
            </p>

            {/* Not yet Shopify-driven: no native Storefront field for a
             * segmented (General/Corporate/HR) enquiry contact block. */}
            <div className="mt-6 text-sm">
              <p className="font-semibold">24X7 Enquiry Support ( ALL Days )</p>
              <p className="mt-2 text-brown-900/70">
                General:{" "}
                <a href="mailto:Contactus@jawharajewllery.ae" className="text-gold-700 underline">
                  Contactus@jawharajewllery.ae
                </a>
              </p>
              <p className="text-brown-900/70">
                Corporate:{" "}
                <a href="mailto:b2b@jawharajewllery.ae" className="text-gold-700 underline">
                  b2b@jawharajewllery.ae
                </a>
              </p>
              <p className="text-brown-900/70">
                Hr:{" "}
                <a href="mailto:careers@jawharajewllery.ae" className="text-gold-700 underline">
                  careers@jawharajewllery.ae
                </a>
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold">{col.title}</p>
              <ul className="flex flex-col gap-2 text-sm text-brown-900/70">
                {col.items.map((link) => (
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
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Find Us On</span>
            <ul className="flex items-center gap-2">
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
            Copyright - {brand.name} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
