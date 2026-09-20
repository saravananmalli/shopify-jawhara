"use client";

import { createContext, useContext, useMemo } from "react";
import { localeConfig, type Direction, type Locale } from "@/config/i18n";
import type { Dictionary } from "@/dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dir: Direction;
  isRtl: boolean;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Carries the language chosen by the URL down to client components. The
 * server layout is the single source of truth (`<html lang dir>`); this only
 * mirrors it, so nothing here can disagree with the rendered document. */
export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const { dir } = localeConfig[locale];
    return { locale, dir, isRtl: dir === "rtl", dictionary };
  }, [locale, dictionary]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale/useDictionary must be used within a LocaleProvider");
  return ctx;
}

export const useLocale = () => useLocaleContext().locale;
export const useDirection = () => useLocaleContext().dir;
export const useDictionary = () => useLocaleContext().dictionary;
