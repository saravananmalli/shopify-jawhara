"use client";

import type { ReactNode } from "react";
import { useDictionary } from "@/store/locale";

/** Section frame + heading shared by every product carousel on the site. */
export default function ProductShelf({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { home } = useDictionary();

  return (
    <section className="border-y border-[#E3D5BC]/60">
      <div className="page-container py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-800">
              {eyebrow ?? home.shelfEyebrow}
            </p>
            <h2 className="mt-1 font-sans text-2xl font-normal text-gold-600 sm:text-3xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 font-sans text-sm text-brown-900/60">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}
