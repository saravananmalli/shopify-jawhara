import type { Locale } from "@/config/i18n";
import type en from "./en.json";

export type Dictionary = typeof en;

// Each locale is a separate chunk, so only the active language is loaded.
// `satisfies` makes a key missing from ar.json a compile error, not a blank
// label in production.
const loaders = {
  en: () => import("./en.json").then((m) => m.default satisfies Dictionary),
  ar: () => import("./ar.json").then((m) => m.default satisfies Dictionary),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> => loaders[locale]();
