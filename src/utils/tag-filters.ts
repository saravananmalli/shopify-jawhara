import { TAG_FILTER_GROUPS } from "@/config/catalog";
import type { CatalogFilter } from "@/types/catalog";

/** A product tag resolved to the filter group and value it stands for. */
export type TagRef = {
  /** TAG_FILTER_GROUPS prefix, or "" for a tag that isn't part of a group. */
  group: string;
  /** Normalised value — what two tags are compared on. */
  key: string;
  /** Value as shown in the UI. */
  label: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

const GROUP_BY_PREFIX = new Map(
  TAG_FILTER_GROUPS.map((group) => [normalize(group.prefix), group]),
);

/** Every plain vocabulary name and alias → its group and shown label. */
const PLAIN_VALUES = new Map<string, { group: string; label: string }>();
for (const group of TAG_FILTER_GROUPS) {
  for (const [label, ...aliases] of group.values) {
    for (const name of [label, ...aliases]) {
      PLAIN_VALUES.set(normalize(name), { group: group.prefix, label });
    }
  }
}

/**
 * `metal:18K White Gold` → Metal / "18K White Gold";
 * `18k-white-gold` (in the Metal vocabulary) → the same; `New Arrival` → no group.
 */
export function refOfTag(tag: string): TagRef {
  const trimmed = tag.trim();
  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    const group = GROUP_BY_PREFIX.get(normalize(trimmed.slice(0, colon)));
    const label = trimmed.slice(colon + 1).trim();
    if (group && label) {
      return { group: group.prefix, key: normalize(label), label };
    }
  }
  const plain = PLAIN_VALUES.get(normalize(trimmed));
  if (plain) {
    return {
      group: plain.group,
      key: normalize(plain.label),
      label: plain.label,
    };
  }
  return { group: "", key: normalize(trimmed), label: trimmed };
}

/** Filter input for a group value. It always uses the prefixed form, so one
 * input covers both the prefixed and the plain tags of that value. */
export const groupValueInput = (prefix: string, label: string) =>
  JSON.stringify({ tag: `${prefix}:${label}` });

/**
 * Sections for TAG_FILTER_GROUPS with the values (and how many products carry
 * each) found in `tagLists`, one list of tags per product. Groups with no
 * tagged product are omitted.
 */
export function buildTagGroupFilters(tagLists: string[][]): CatalogFilter[] {
  return TAG_FILTER_GROUPS.flatMap((group) => {
    const values = new Map<string, { label: string; count: number }>();
    for (const tags of tagLists) {
      const seen = new Set<string>();
      for (const tag of tags) {
        const ref = refOfTag(tag);
        if (ref.group !== group.prefix || seen.has(ref.key)) continue;
        seen.add(ref.key);
        const entry = values.get(ref.key) ?? { label: ref.label, count: 0 };
        entry.count += 1;
        values.set(ref.key, entry);
      }
    }
    if (values.size === 0) return [];

    return [
      {
        id: `tag-group.${group.prefix}`,
        label: group.label,
        type: "LIST" as const,
        values: [...values.entries()]
          .sort(([, a], [, b]) => a.label.localeCompare(b.label))
          .map(([key, value]) => ({
            id: `tag-group.${group.prefix}.${key}`,
            label: value.label,
            count: value.count,
            input: groupValueInput(group.prefix, value.label),
          })),
      },
    ];
  });
}

/** Product tags → what each filter group needs: ANY of its values, in EVERY group. */
export function matchesTagGroups(
  tags: string[],
  wanted: { group: string; keys: Set<string> }[],
): boolean {
  if (wanted.length === 0) return true;
  const refs = tags.map(refOfTag);
  return wanted.every(({ group, keys }) =>
    refs.some((ref) => ref.group === group && keys.has(ref.key)),
  );
}
