/**
 * Column counts and gaps shared by every product grid, carousel and skeleton,
 * so a loading placeholder always breaks at the same widths as the real
 * content and the page never shifts when data arrives. Literal class strings
 * (not built dynamically) so Tailwind can see them.
 */
export const PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

/** Width of one carousel item: matches PRODUCT_GRID_CLASS columns and gaps. */
export const PRODUCT_CAROUSEL_ITEM_CLASS =
  "w-[calc(50%-6px)] sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]";

/** Row gap of a product carousel: matches PRODUCT_GRID_CLASS. */
export const PRODUCT_CAROUSEL_GAP_CLASS = "gap-3 sm:gap-4";

/**
 * Width of a category tile in a horizontal strip: fluid so two tiles plus a
 * peek of the next fit on a phone, capped at the 226px design size.
 * Tile height follows from CATEGORY_TILE_IMAGE_CLASS.
 */
export const CATEGORY_TILE_WIDTH_CLASS = "w-[clamp(8.5rem,38vw,14.125rem)]";
export const CATEGORY_TILE_IMAGE_CLASS = "aspect-[226/240]";
