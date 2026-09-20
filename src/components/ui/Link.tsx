"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/store/locale";
import { localizePath } from "@/utils/locale-path";

/** Drop-in for `next/link` that keeps the shopper in their language: internal
 * paths get the locale prefix, external URLs and hash links are left alone. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localised = typeof href === "string" ? localizePath(href, locale) : href;
  return <NextLink href={localised} {...props} />;
}
