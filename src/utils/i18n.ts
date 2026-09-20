import type { Locale } from "@/config/i18n";

/** Fills `{name}` placeholders. Kept to plain substitution — word order in
 * Arabic differs from English, so each language's sentence is written out in
 * full in its own dictionary rather than assembled from fragments. */
export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/** Picks the plural form for `count` using the locale's real CLDR rules —
 * Arabic has six forms (zero/one/two/few/many/other), English two — and fills
 * its `{count}`. Missing forms fall back to `other`. */
export function pluralize(
  locale: Locale,
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
  /** What to print for `{count}` when it isn't the bare number ("1,204+"). */
  display?: string | number
): string {
  const rule = new Intl.PluralRules(locale).select(count);
  return formatMessage(forms[rule] ?? forms.other, { count: display ?? count });
}
