import type { NavLink } from "@/types/content";

const pathOf = (url: string) => url.split(/[?#]/)[0].replace(/\/$/, "") || "/";

/** Catch-all destinations ("All jewellery", home) sit in many dropdowns, and
 * a menu item with no real link of its own resolves to home ("/"), so they
 * must not light up every menu that happens to list them. */
const SHARED_PATHS = new Set(["/", "/collections"]);

/** A nav item is current when the shopper is on its own page or on a page
 * linked only from its dropdown (so "Jewellery" stays lit on a ring
 * collection). `pathname` is the route without its language prefix. */
export function isNavLinkActive(link: NavLink, pathname: string): boolean {
  const current = pathOf(pathname);
  const own = pathOf(link.url);
  if (own === current && !SHARED_PATHS.has(own)) return true;
  return link.items.some((child) => isNavLinkActive(child, pathname));
}

/** Text colour of the current page's item — the brand primary. */
export const NAV_ACTIVE_TEXT = "text-gold-600";
