import MenuLink from "@/components/layout/MenuLink";
import DirhamText from "@/components/ui/DirhamText";
import type { NavLink } from "@/types/content";

const HEADING_CLASS =
  "mb-3 block text-[11px] font-semibold uppercase tracking-widest text-gold-700";

/** A mega-menu column's title. A column left unlinked in Shopify's menu editor
 * resolves to "/" (toSafeInternalPath's fallback) — that's a heading, not a
 * real destination, so it renders as plain text instead of a link to home. */
export default function MenuColumnHeading({ column }: { column: NavLink }) {
  if (column.url === "/") {
    return (
      <p className={HEADING_CLASS}>
        <DirhamText text={column.title} />
      </p>
    );
  }
  return (
    <MenuLink href={column.url} className={`${HEADING_CLASS} hover:underline`}>
      <DirhamText text={column.title} />
    </MenuLink>
  );
}
