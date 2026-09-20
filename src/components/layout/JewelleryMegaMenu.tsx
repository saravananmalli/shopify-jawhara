"use client";

import Link from "@/components/ui/Link";
import MenuLink from "@/components/layout/MenuLink";
import MenuPanel from "@/components/layout/MenuPanel";
import { ChevronDownIcon, ChevronRightIcon, CheckIcon } from "@/components/icons";
import DepartmentFlyoutRow from "@/components/layout/DepartmentFlyoutRow";
import DirhamText from "@/components/ui/DirhamText";
import { useMenuIntent } from "@/hooks/useMenuIntent";
import { useDictionary } from "@/store/locale";
import type { NavLink } from "@/types/content";

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
  const { megaMenu: t } = useDictionary();
  const hasColumns = link.items.length > 0;
  const departmentColumn = link.items.find(
    (column) => column.key === "department"
  );
  const otherColumns = link.items.filter((column) => column !== departmentColumn);

  const { armed, intentProps } = useMenuIntent();

  return (
    <li
      {...intentProps}
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
        <MenuPanel armed={armed}>
          <div className="w-full border-t border-gold-100 bg-white normal-case shadow-xl">
            <div className="flex page-container gap-10 py-6">
              <div className="w-56 shrink-0 border-e border-gold-100 pe-6">
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
                    {t.vipConcierge}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brown-900/70">
                    {t.conciergeText}
                  </p>
                  <MenuLink
                    href="/pages/boutiques"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                  >
                    {t.bookViewing} <ChevronRightIcon className="h-3 w-3" />
                  </MenuLink>
                </div>
              </div>

              {otherColumns.map((column) => (
                <div key={column.title} className="min-w-[140px] flex-1">
                  <MenuLink
                    href={column.url}
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-gold-700 hover:underline"
                  >
                    <DirhamText text={column.title} />
                  </MenuLink>
                  {column.items.length > 0 && (
                    <ul className="flex flex-col gap-2.5">
                      {column.items.map((leaf) => (
                        <li key={leaf.title}>
                          <MenuLink
                            href={leaf.url}
                            className="text-sm text-brown-900/80 transition-colors hover:text-gold-700"
                          >
                            <DirhamText text={leaf.title} />
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="flex page-container flex-wrap items-center justify-between gap-3 border-t border-gold-100 py-4">
              <p className="flex flex-wrap items-center gap-4 text-xs text-brown-900/70">
                <span className="font-semibold text-brown-900">{t.guaranteesTitle}</span>
                {t.guarantees.map((item) => (
                  <span key={item} className="flex items-center gap-1">
                    <CheckIcon className="h-3.5 w-3.5 text-gold-600" />
                    {item}
                  </span>
                ))}
              </p>
              <MenuLink
                href="/collections"
                className="whitespace-nowrap text-xs font-semibold text-gold-700 hover:underline"
              >
                {t.viewAllCreations} <ChevronRightIcon className="inline h-3 w-3" />
              </MenuLink>
            </div>
          </div>
        </MenuPanel>
      )}
    </li>
  );
}
