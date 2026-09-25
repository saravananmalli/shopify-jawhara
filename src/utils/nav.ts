import type { NavLink } from "@/types/content";

const pathOf = (url: string) => url.split(/[?#]/)[0].replace(/\/$/, "") || "/";

/** Catch-all destinations ("All jewellery", home) sit in many dropdowns, so
 * they must not light up every menu that happens to list them. */
const SHARED_PATHS = new Set(["/", "/collections"]);

/** A nav item is current when the shopper is on its own page or on a page
 * linked only from its dropdown (so "Jewellery" stays lit on a ring
 * collection). `pathname` is the route without its language prefix. */
export function isNavLinkActive(link: NavLink, pathname: string, nested = false): boolean {
  const current = pathOf(pathname);
  const own = pathOf(link.url);
  if (own === current && !(nested && SHARED_PATHS.has(own))) return true;
  return link.items.some((child) => isNavLinkActive(child, pathname, true));
}

/** Text colour of the current page's item — the brand primary. */
export const NAV_ACTIVE_TEXT = "text-gold-600";
