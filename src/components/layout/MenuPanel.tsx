"use client";

import type { ReactNode } from "react";
import { MenuIntentContext } from "@/hooks/useMenuIntent";

/** The hover/focus dropdown shell shared by every mega-menu. */
export default function MenuPanel({
  armed,
  children,
}: {
  /** Whether the menu item has been hovered/focused yet — see useMenuIntent. */
  armed: boolean;
  children: ReactNode;
}) {
  return (
    <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition-[opacity,visibility] duration-200 ease-luxury group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <MenuIntentContext value={armed}>{children}</MenuIntentContext>
    </div>
  );
}
