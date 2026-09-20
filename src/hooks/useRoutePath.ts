import { usePathname } from "next/navigation";
import { splitLocale } from "@/utils/locale-path";

/** The current path without its language prefix (`/ar/collections/x` →
 * `/collections/x`), for checking which page the shopper is on. */
export function useRoutePath(): string {
  return splitLocale(usePathname()).rest;
}
