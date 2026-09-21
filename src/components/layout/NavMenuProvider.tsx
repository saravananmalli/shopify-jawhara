"use client";

import { useState, type ReactNode } from "react";
import { NavMenuContext } from "@/hooks/useMenuIntent";
import { useRoutePath } from "@/hooks/useRoutePath";

/** Shares one "which mega-menu is open" value across the category nav, so
 * opening a menu closes the others. Also closes it when the page changes. */
export default function NavMenuProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Adjusting state during render (not an effect): navigating from a link in
  // an open panel must not leave that panel open under the pointer.
  const pathname = useRoutePath();
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpenId(null);
  }

  return <NavMenuContext value={{ openId, setOpenId }}>{children}</NavMenuContext>;
}
