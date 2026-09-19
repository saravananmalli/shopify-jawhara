import type { Product } from "@/types/product";

export type NavLink = {
  title: string;
  url: string;
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
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  products: Product[];
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
