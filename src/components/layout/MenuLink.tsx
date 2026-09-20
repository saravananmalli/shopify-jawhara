"use client";

import { useContext, type ComponentProps } from "react";
import Link from "@/components/ui/Link";
import { MenuIntentContext } from "@/hooks/useMenuIntent";

/** A link inside a mega-menu panel: prefetched only once its menu is armed. */
export default function MenuLink({ prefetch, ...props }: ComponentProps<typeof Link>) {
  const armed = useContext(MenuIntentContext);
  return <Link prefetch={armed ? prefetch : false} {...props} />;
}
