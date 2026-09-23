"use client";

import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDictionary } from "@/store/locale";

/** Section frame + heading shared by every product carousel on the site. */
export default function ProductShelf({
  eyebrow,
  title,
  subtitle,
  actions,
  tightOnPhone = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** 24px instead of 40px above and below the shelf, on phones only. */
  tightOnPhone?: boolean;
  children: ReactNode;
}) {
  const { home } = useDictionary();

  return (
    <section className="border-y border-[#E3D5BC]/60">
      <div className={`page-container ${tightOnPhone ? "py-6 sm:py-10" : "py-10"}`}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <SectionHeading eyebrow={eyebrow ?? home.shelfEyebrow} title={title} subtitle={subtitle} />
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}
