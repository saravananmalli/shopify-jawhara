"use client";

import Link from "@/components/ui/Link";
import { useDictionary } from "@/store/locale";

export type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { common } = useDictionary();

  return (
    <nav aria-label={common.breadcrumb} className="font-sans text-xs text-brown-900/60 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-gold-700">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-brown-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
