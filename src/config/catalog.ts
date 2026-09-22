import type { CatalogSortKey } from "@/types/catalog";

export const CATALOG_PAGE_SIZE = 24;

/**
 * How long product, listing and search responses may be reused (Next data
 * cache on the server, in-memory in the browser). Price and availability shown
 * on a card can therefore lag Shopify by up to this long; adding to the bag is
 * never cached and Shopify re-checks stock there, so it can't oversell.
 */
export const PRODUCT_REVALIDATE_SECONDS = 60;

/** Shopify's automatic "all products" URL — not exposed by the Storefront
 * API, so the catalog service falls back to `search` for it. */
export const ALL_PRODUCTS_HANDLE = "all";
export const ALL_PRODUCTS_TITLE = "All Jewellery";

/** The storefront's main navigation. On a collection page the category tiles
 * are the other links in the same mega-menu column as that collection (e.g.
 * on "18K Yellow Gold": the whole GEM & METAL column), so the tiles are
 * managed by editing the menu in Shopify Admin → Content → Menus. */
export const MAIN_MENU_HANDLE = "main-menu";

/** Shown when the current collection isn't in any main-menu column (e.g.
 * "all"): a menu of collection links to fall back on. */
export const CATEGORY_MENU_HANDLE = "collections";

/**
 * Main-menu columns (by title, any case) whose collections are *curations*
 * rather than product categories. Inside one of them the category tiles
 * (Rings, Pendants…) narrow that collection's own products instead of
 * linking to the store-wide category page.
 */
/** The collection behind the Gifts menu's "Shop the collection" card. It isn't
 * a menu link, so on its own page the category tiles filter it in place
 * instead of leading to other collection pages. */
export const GIFTS_PROMO_HANDLE = "gift";

/** Shopify collection that curates the homepage "Signature Masterpieces" shelf
 * (its "All Masterpieces" tab): add products to it (and drag to reorder) in
 * Admin → Products → Collections. Until it has products, the shelf shows the
 * top best sellers. */
export const MASTERPIECES_COLLECTION_HANDLE = "statement-masterpieces";

/** Shopify collection whose image and link back the homepage atelier section. */
export const ATELIER_COLLECTION_HANDLE = "solitaire";

export const CATEGORY_SCOPED_MENU_COLUMNS = ["curations & style"];

/** Labels live in the dictionary (`collection.sort`), keyed by sort key.
 * Best Selling / New In deliberately left out — they'd read as duplicates of
 * the New Arrival/Bestseller quick-tag filter below, even though the sort
 * (Shopify's real sales/created-date signal) and the tag (merchant-curated)
 * aren't quite the same thing. One home for that concept avoids the confusion. */
export const SORT_OPTION_KEYS: CatalogSortKey[] = [
  "RECOMMENDED",
  "PRICE_ASC",
  "PRICE_DESC",
];

/** Quick-filter chips above the grid. Each filters on a Shopify product tag
 * (Admin → Products → Tags) — a chip with no tagged products shows the empty state. */
export const QUICK_TAG_CHIPS = [
  { key: "newArrival", tag: "New Arrival" },
  { key: "bestseller", tag: "Bestseller" },
  { key: "trending", tag: "Trending" },
] as const;

export type PriceBand = { min?: number; max?: number };

/** Price-filter checkboxes (shop currency). min is inclusive, max exclusive. */
export const PRICE_BANDS: PriceBand[] = [
  { max: 1000 },
  { min: 1000, max: 2500 },
  { min: 2500, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000 },
];

/**
 * Filter sections built from product tags in Shopify Admin. A product joins a
 * section either with a prefixed tag — `metal:18K White Gold`, `brand:Filo` —
 * which needs no code change and can hold any value, or with a plain tag from
 * `values` below (`18K White Gold`, `Pearl`). In `values`, the first name is
 * the label shown and the rest are aliases (`Diamonds` counts as `Diamond`).
 * Matching ignores case, hyphens and underscores. A section with no tagged
 * products is hidden.
 */
export const TAG_FILTER_GROUPS: readonly {
  prefix: string;
  label: string;
  values: readonly (readonly string[])[];
}[] = [
  {
    prefix: "metal",
    label: "Metal",
    values: [
      ["18K Yellow Gold"],
      ["18K Rose Gold"],
      ["18K White Gold"],
      ["22K Yellow Gold"],
      ["21K Yellow Gold"],
      ["Platinum"],
      ["Silver"],
    ],
  },
  {
    prefix: "stone",
    label: "Stone",
    values: [
      ["Diamond", "Diamonds"],
      ["Pearl", "Pearls"],
      ["Ruby", "Rubies"],
      ["Emerald", "Emeralds"],
      ["Sapphire", "Sapphires"],
    ],
  },
  {
    prefix: "occasion",
    label: "Occasion",
    values: [
      ["Wedding Wear"],
      ["Eid & Festive Celebrations", "Eid Festive Celebrations"],
      ["Party Wear"],
      ["Mother's Day", "Mothers Day"],
      ["Daily Wear"],
      ["Office Wear"],
    ],
  },
  { prefix: "stone-color", label: "Stone color", values: [] },
  { prefix: "shape", label: "Shape", values: [] },
  { prefix: "brand", label: "Brand", values: [] },
];

/** Real Shopify collection handles powering the "GOLD", "DIAMONDS" and
 * "PEARLS" navs' image tiles — they must match collections that exist in
 * Shopify Admin (Products → Collections); ones that don't exist yet are
 * skipped. Update these lists if a collection is renamed. */
export const GOLD_CATEGORY_HANDLES = [
  "gold-rings",
  "gold-earrings",
  "gold-pendant",
  "gold-necklace",
  "gold-bracelet",
  "gold-bangles",
  "gold-bars-coins",
];
export const DIAMOND_CATEGORY_HANDLES = [
  "diamond-rings",
  "diamond-earrings",
  "diamond-pendant",
  "diamond-necklace",
  "diamond-bracelet",
  "diamond-bangles",
];
export const PEARL_CATEGORY_HANDLES = [
  "pearl-rings",
  "pearl-earrings",
  "pearl-pendant",
  "pearl-necklace",
  "pearl-bracelet",
];

/**
 * Sets of collections that sit together but aren't a Shopify menu column.
 * On a page for any collection in a set, the category tiles are that whole
 * set (e.g. on "Gold Rings": Gold Rings, Gold Earrings, Gold Pendant…). A
 * collection found in a menu column keeps that column's tiles instead.
 */
export const CATEGORY_TILE_GROUPS: string[][] = [
  GOLD_CATEGORY_HANDLES,
  DIAMOND_CATEGORY_HANDLES,
  PEARL_CATEGORY_HANDLES,
];

/** The category tiles on collection pages that belong to no menu column (the
 * Jewellery link / "all" page), in the same order as the "Shop By Type" column
 * so those pages match a category page like Rings. */
export const JEWELLERY_CATEGORY_HANDLES = [
  "rings",
  "pendants",
  "earrings",
  "necklace",
  "bangles",
  "bracelet",
];

/** Real Shopify collections powering the homepage "Shop By Category" strip
 * and the mobile bottom bar's category sheet
 * — the plain, material-agnostic collections (not the "Gold Rings" /
 * "Diamond Rings" / "Pearl Rings" material-line variants). */
export const SHOP_BY_CATEGORY_HANDLES = [
  "rings",
  "earrings",
  "pendants",
  "necklace",
  "bracelet",
  "bangles",
];
