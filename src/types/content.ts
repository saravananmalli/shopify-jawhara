export type NavLink = {
  /** Lower-cased default-language title. Stays the same in every language, so
   * code that recognises a menu entry ("gifts", "department") keeps working
   * once `title` is translated. Never display it. */
  key: string;
  title: string;
  url: string;
  /** Small label shown next to the link (e.g. "New") — see `toNavLinks`. */
  badge?: string;
  items: NavLink[];
};

export type Brand = {
  name: string;
  logoUrl: string | null;
  logoAlt: string;
  slogan: string | null;
  shortDescription: string | null;
};

export type CategoryTile = {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Products in the current collection — only set for scoped category tiles. */
  count?: number;
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type HeroBanner = {
  id: string;
  imageUrl: string | null;
  imageAlt: string;
  hasBakedInText: boolean;
  eyebrow: string;
  arabicLine: string | null;
  englishLine: string;
  badgeLabel: string;
  badgeValue: string;
  href: string;
};

export type Occasion = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  badgeLabel: string;
  badgeText: string;
  ctaLabel: string;
  ctaHref: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  customerName: string;
  detail: string;
  rating: number;
};

/** One physical Jawhara store, from the `store_location` metaobject. */
export type StoreLocation = {
  id: string;
  name: string;
  address: string;
  country: string;
  region: string;
  phone: string;
  hours: string;
  /** Google Maps link for the Directions button; "" when missing or unsafe. */
  mapLink: string;
  /** Null when neither lat/lng fields nor the map link yielded a position. */
  coordinates: { lat: number; lng: number } | null;
};

export type SitemapEntry = {
  handle: string;
  updatedAt: string | null;
};

/** A Shopify online-store page ("About", "FAQ"…) or shop policy, as merchant HTML. */
export type ContentPage = {
  handle: string;
  title: string;
  /** Merchant-authored HTML from Shopify Admin — sanitise before rendering. */
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
};
