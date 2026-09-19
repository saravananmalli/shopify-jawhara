"use client";

import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon, CheckIcon } from "@/components/icons";
import DepartmentFlyoutRow from "@/components/layout/DepartmentFlyoutRow";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";

const GUARANTEES = [
  "100% Certified Natural Diamonds",
  "15-Day Exchange Policy",
  "Lifetime Jewellery Maintenance",
];

/**
 * The flagship layout for the "Jewellery" nav item. Every column shows at
 * once (no tab-switching) — a "Department" column (matched by title, if
 * present in the real Shopify menu data) renders as a highlighted sidebar
 * with its first item styled as active, and every other direct child of
 * "Jewellery" renders as its own column alongside it. All columns/links
 * are real Shopify menu data; only the sidebar highlight, VIP Concierge
 * box, and guarantees bar are static editorial chrome (Shopify's menu API
 * has no field for a promo box or per-item badges). The VIP Concierge box
 * always renders in the left column regardless of whether "Department"
 * exists in the menu data, since it's independent static content, not
 * something that should disappear if that Shopify menu item is deleted.
 */
export default function JewelleryMegaMenu({
  link,
  isActive,
}: {
  link: NavLink;
  isActive: boolean;
}) {
  const hasColumns = link.items.length > 0;
  const departmentColumn = link.items.find(
    (column) => column.title.trim().toLowerCase() === "department"
  );
  const otherColumns = link.items.filter((column) => column !== departmentColumn);

  return (
    <li
      className="group"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
    >
      <Link
        href={link.url}
        aria-haspopup={hasColumns ? "true" : undefined}
        className={`flex items-center gap-1 whitespace-nowrap uppercase outline-none transition-colors hover:text-gold-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${
          isActive ? "text-gold-700" : ""
        }`}
      >
        <DirhamText text={link.title} />
        {hasColumns && (
          <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 ease-luxury group-hover:rotate-180 group-focus-within:rotate-180" />
        )}
      </Link>

      {hasColumns && (
        <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition-[opacity,visibility] duration-200 ease-luxury group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="w-full border-t border-gold-100 bg-white normal-case shadow-xl">
            <div className="mx-auto flex max-w-8xl gap-10 px-4 py-6">
              <div className="w-56 shrink-0 border-r border-gold-100 pr-6">
                {departmentColumn && (
                  <>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gold-700">
                      <DirhamText text={departmentColumn.title} />
                    </p>
                    <ul className="mb-5 flex flex-col gap-1">
                      {departmentColumn.items.map((item, index) => (
                        <DepartmentFlyoutRow
                          key={item.title}
                          item={item}
                          highlighted={index === 0}
                        />
                      ))}
                    </ul>
                  </>
                )}

                <div className="rounded-xl bg-cream-100 p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-600" aria-hidden />
                    VIP Concierge
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brown-900/70">
                    Book a bespoke showroom viewing or private video consultation
                    with our gemologists.
                  </p>
                  <Link
                    href="/pages/boutiques"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                  >
                    Book Private Viewing <ChevronRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {otherColumns.map((column) => (
                <div key={column.title} className="min-w-[140px] flex-1">
                  <Link
                    href={column.url}
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-gold-700 hover:underline"
                  >
                    <DirhamText text={column.title} />
                  </Link>
                  {column.items.length > 0 && (
                    <ul className="flex flex-col gap-2.5">
                      {column.items.map((leaf) => (
                        <li key={leaf.title}>
                          <Link
                            href={leaf.url}
                            className="text-sm text-brown-900/80 transition-colors hover:text-gold-700"
                          >
                            <DirhamText text={leaf.title} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-3 border-t border-gold-100 px-4 py-4">
              <p className="flex flex-wrap items-center gap-4 text-xs text-brown-900/70">
                <span className="font-semibold text-brown-900">Client Guarantees:</span>
                {GUARANTEES.map((item) => (
                  <span key={item} className="flex items-center gap-1">
                    <CheckIcon className="h-3.5 w-3.5 text-gold-600" />
                    {item}
                  </span>
                ))}
              </p>
              <Link
                href="/collections"
                className="whitespace-nowrap text-xs font-semibold text-gold-700 hover:underline"
              >
                View All Creations &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
