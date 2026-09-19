"use client";

import Link from "next/link";
import { ChevronDownIcon } from "@/components/icons";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";

/**
 * "Our Collections" nav item — a flat grid of its direct Shopify menu
 * items (same menu-driven pattern as Jewellery/Gifts), styled as a plain
 * multi-column grid instead of headed sections.
 */
export default function OurCollectionsMegaMenu({
  link,
  isActive,
}: {
  link: NavLink;
  isActive: boolean;
}) {
  const hasContent = link.items.length > 0;

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
        aria-haspopup={hasContent ? "true" : undefined}
        className={`flex items-center gap-1 whitespace-nowrap uppercase outline-none transition-colors hover:text-gold-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${
          isActive ? "text-gold-700" : ""
        }`}
      >
        <DirhamText text={link.title} />
        {hasContent && (
          <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 ease-luxury group-hover:rotate-180 group-focus-within:rotate-180" />
        )}
      </Link>

      {hasContent && (
        <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition-[opacity,visibility] duration-200 ease-luxury group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="w-full border-t border-gold-100 bg-white normal-case shadow-xl">
            <div className="mx-auto grid max-w-8xl grid-cols-6 gap-x-8 gap-y-5 px-4 py-6">
              {link.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="text-sm font-medium text-brown-900 transition-colors hover:text-gold-700"
                >
                  <DirhamText text={item.title} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
