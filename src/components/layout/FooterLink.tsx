"use client";

import type { ReactNode } from "react";
import Link from "@/components/ui/Link";
import { useRoutePath } from "@/hooks/useRoutePath";
import { NAV_ACTIVE_TEXT } from "@/utils/nav";

/** Footer link that shows in the primary colour while its page is open. */
export default function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = useRoutePath();
  const active = pathname.replace(/\/$/, "") === href.split(/[?#]/)[0].replace(/\/$/, "");

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? `${NAV_ACTIVE_TEXT} font-medium` : "hover:text-gold-700"}
    >
      {children}
    </Link>
  );
}
