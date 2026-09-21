import Image from "next/image";

const NAV_ICON_SRC = {
  home: "/brand/icons/nav/home.webp",
  categories: "/brand/icons/nav/categories.webp",
  collections: "/brand/icons/nav/collections.svg",
  wishlist: "/brand/icons/nav/wishlist.webp",
  account: "/brand/icons/nav/account.webp",
  cart: "/brand/icons/nav/cart.webp",
  support: "/brand/icons/support.webp",
  search: "/brand/icons/search.svg",
} as const;

export type NavIconName = keyof typeof NAV_ICON_SRC;

/**
 * The brand's line icons for the header and phone tab bar (home, categories,
 * wishlist, account, bag) — one artwork set so both bars match. Decorative:
 * the button or link around it carries the accessible name. Intrinsic size is
 * 66px, so it stays sharp up to ~33px on 2x screens.
 *
 * `tinted` paints the artwork in the surrounding text colour (via a CSS mask
 * of the icon's alpha) instead of its own dark brown, so a bar can colour the
 * active item with the brand primary.
 */
export default function NavIcon({
  name,
  className = "h-6 w-6",
  tinted = false,
}: {
  name: NavIconName;
  className?: string;
  tinted?: boolean;
}) {
  if (tinted) {
    const mask = `url(${NAV_ICON_SRC[name]})`;
    return (
      <span
        aria-hidden
        className={`inline-block bg-current ${className}`}
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    );
  }

  return (
    <Image src={NAV_ICON_SRC[name]} alt="" width={66} height={66} className={className} />
  );
}
