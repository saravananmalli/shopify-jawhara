/**
 * Photography for the Heritage Since 1907 page. Each slot is a URL: a Shopify
 * CDN link (Admin → Content → Files → copy link) or a path under /public.
 * `null` renders an editorial placeholder panel instead.
 *
 * TEMPORARY: the /heritage/*.jpg files are stand-in photos from Wikimedia
 * Commons (CC BY / CC BY-SA), not Jawhara imagery — replace every slot with
 * brand photography from Shopify before launch.
 */
export type HeritageImageSource = { url: string; alt: string } | null;

/** `file` includes its extension — jpg, webp, avif or png all work. */
const photo = (file: string, alt: string): HeritageImageSource => ({ url: `/heritage/${file}`, alt });

const hero = photo("hero.jpg", "Gold jewellery on display in the Dubai Gold Souk");
const beginning = photo("beginning.webp", "The entrance of a Jawhara Jewellery building");
const expansion = photo("expansion.jpg", "The glass front of a Jawhara Jewellery store, lit in warm gold");
const tradition = photo("tradition.jpg", "A woman in traditional dress wearing a Jawhara pendant");
const culture = photo("culture.jpg", "Traditional gold and turquoise necklaces on embroidered clothing");
const contemporary = photo("contemporary.jpg", "A woman wearing modern diamond palm-tree jewellery");
const fairuz = photo("fairuz.jpg", "A pearl necklace");
const closing = photo("closing.jpg", "Sunset over Dubai");

/** One photo per timeline chapter, in the order of `heritage.timeline.milestones`. */
const timeline: HeritageImageSource[] = [
  photo("1907.png", "Dhow traders sorting goods on the Dubai Creek at sunset"),
  photo("1958.png", "Men beside dhows on the Dubai Creek shore"),
  photo("1961.png", "A goldsmith crafting jewellery in a Bedouin tent"),
  photo("1965.png", "A merchant weighing gold and pearls in a lantern-lit souq stall"),
  photo("1972.png", "A craftsman hammering an ornate gold cuff"),
  photo("1975.png", "A jeweller at his stall in a busy souq lane"),
  photo("1979.png", "A trader counting pearls on a wharf beside the creek"),
  photo("1983.png", "Antique gold and pearl jewellery displayed on a stone"),
  photo("1995.png", "Customers browsing gold in a Jawhara Jewellery store"),
  photo("2013.png", "A goldsmith pouring molten gold in his workshop"),
  photo("2014.png", "A bride and her mother choosing jewellery in a Jawhara store"),
  photo("2018.png", "A woman being presented with a diamond necklace in a hotel suite"),
  photo("2021.png", "A diamond expert examining a stone at his desk above the Dubai skyline"),
  photo("2022.png", "A woman wearing a diamond necklace on a Dubai terrace at dusk"),
  photo("2023.png", "A woman in a long pearl necklace looking out over the Dubai skyline at night"),
  // The final (2026) milestone is shown as the stats section, which has no photo.
  null,
];

export const heritageImages = {
  hero,
  beginning,
  expansion,
  tradition,
  culture,
  contemporary,
  fairuz,
  closing,
  /** Same order as `heritage.timeline.milestones` in the dictionaries. */
  timeline,
};
