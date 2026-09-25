import sanitizeHtml from "sanitize-html";
import type Anthropic from "@anthropic-ai/sdk";
import type { Locale } from "@/config/i18n";
import { contact } from "@/config/contact";
import { SAME_DAY_CUTOFF_HOUR, SAME_DAY_EMIRATES } from "@/config/delivery";
import { FAQ_PAGE, STATIC_POLICIES, toContentPage } from "@/content/static-pages";
import {
  filterProducts,
  getCollectionProducts,
  getMenu,
  getProductByHandle,
  getProducts,
  getShopPolicy,
  getStoreLocations,
  POLICY_HANDLES,
  type PolicyHandle,
} from "@/services/shopify";
import { MAIN_MENU_HANDLE } from "@/config/catalog";
import { isPastSameDayCutoff } from "@/utils/delivery";
import { getGoldPrices, type GoldPrices } from "@/services/gold-price";
import type { NavLink } from "@/types/content";
import type { Product } from "@/types/product";
import { LAYLA_LINK_IDS } from "@/types/layla";

/** Every product a tool has shown the model this turn, keyed by a short ref
 * ("p1", "p2"…). `respond` may only cite refs from here, so a card can never be
 * for an invented product — and the reply stays short: a ref costs a couple of
 * tokens where a product handle costs dozens, and output tokens are the wait. */
export type ProductPool = Map<string, Product>;

/** `gold` is filled by get_gold_price so the reply can render the real rate card. */
export type GoldHolder = { value: GoldPrices | null };
type ToolContext = { locale: Locale; pool: ProductPool; gold: GoldHolder };
type Tool = {
  definition: Anthropic.Tool;
  run: (input: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
};

const TEXT_LIMIT = 3500;

const text = (value: unknown, max = 100): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const price = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
const count = (value: unknown, fallback: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.floor(value), 1), max)
    : fallback;

/** Shopify parses the query as search syntax; strip operators so a shopper's
 * words can't inject field filters (`tag:`, `-vendor:`…). */
function toSearchTerms(query: string): string {
  return query.replace(/[:"()\\<>{}[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

function refFor(product: Product, pool: ProductPool): string {
  for (const [ref, known] of pool) if (known.handle === product.handle) return ref;
  const ref = `p${pool.size + 1}`;
  pool.set(ref, product);
  return ref;
}

const BAND_POOL_SIZE = 24;

/** Rounds to a price step a shopper would recognise (AED 3,000, not 2,987). */
function niceStep(n: number): number {
  return n < 500 ? 50 : n < 1000 ? 100 : n < 5000 ? 250 : n < 20000 ? 1000 : 5000;
}

/**
 * Up to three price ranges cut from the real spread of matching pieces, each
 * with how many pieces fall in it — so every range offered to a shopper is
 * guaranteed to return something. The first range starts at the true cheapest
 * price ("from 2,650"), the rest at round numbers. Few pieces are split at their
 * biggest price gaps (so three necklaces at 2,650 / 4,565 / 16,300 become
 * "2,650–5,000" and "5,000–17,000"); many are split into thirds.
 */
function priceBands(amounts: number[]): { from: number; to: number; count: number }[] {
  const sorted = [...amounts].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return [];
  const roundUp = (value: number, reference: number) => {
    const step = niceStep(reference);
    return Math.ceil(value / step) * step;
  };

  let cuts: number[];
  if (n <= 6) {
    const wanted = n >= 5 ? 3 : n >= 3 ? 2 : 1;
    cuts = sorted
      .slice(1)
      .map((upper, i) => ({ lower: sorted[i], upper, ratio: upper / sorted[i] }))
      .filter((gap) => gap.ratio > 1.15)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, wanted - 1)
      .map(({ lower, upper }) => {
        const cut = roundUp(lower, upper);
        return cut < upper ? cut : lower;
      });
  } else {
    cuts = [sorted[Math.floor(n / 3)], sorted[Math.floor((2 * n) / 3)]].map((v) => roundUp(v, v));
  }
  const top = sorted[n - 1];
  const edges = [...new Set([...cuts, roundUp(top, top)])].sort((a, b) => a - b);

  const bands: { from: number; to: number; count: number }[] = [];
  let from = sorted[0];
  for (const to of edges) {
    if (to <= from) continue;
    // The shared boundary belongs to the lower band.
    const count = sorted.filter((v) => (bands.length === 0 ? v >= from : v > from) && v <= to).length;
    if (count > 0) bands.push({ from, to, count });
    from = to;
  }
  return bands;
}

function summarize(product: Product, pool: ProductPool) {
  return {
    ref: refFor(product, pool),
    handle: product.handle,
    title: product.title,
    price: product.price.amount,
    currency: product.price.currencyCode,
    compare_at_price: product.compareAtPrice?.amount ?? null,
    available: product.available,
    tags: product.tags.slice(0, 8),
  };
}

const plainText = (html: string, max = TEXT_LIMIT) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

function flattenCollections(links: NavLink[], out: { title: string; handle: string }[] = []) {
  for (const link of links) {
    const match = /\/collections\/([a-z0-9-]+)/i.exec(link.url);
    if (match && !out.some((entry) => entry.handle === match[1])) {
      out.push({ title: link.title, handle: match[1] });
    }
    flattenCollections(link.items, out);
  }
  return out;
}

const searchProducts: Tool = {
  definition: {
    name: "search_products",
    description:
      "Search Jawhara's live catalog for products that are in stock. Use short keywords (category and/or material, 1–3 words). Prices are in the store currency. Returns product summaries plus price_bands: real price ranges (with piece counts) for these pieces, to offer as tappable chips. If nothing matches the budget, returns no_exact_matches, the closest_matches outside it, and price_bands for the pieces beyond the budget.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: 'Short keywords, e.g. "diamond earrings" or "gold necklace".' },
        min_price: { type: ["number", "null"], description: "Lowest price, or null." },
        max_price: { type: ["number", "null"], description: "Highest price, or null." },
        sort: { type: "string", enum: ["relevance", "price_asc", "price_desc"] },
        limit: { type: "integer", description: "1–8; use 5 for a first showing." },
      },
      required: ["query", "min_price", "max_price", "sort", "limit"],
      additionalProperties: false,
    },
    strict: true,
  },
  async run(input, { locale, pool }) {
    const terms = toSearchTerms(text(input.query));
    if (!terms) return { error: "query is empty" };
    const min = price(input.min_price);
    const max = price(input.max_price);
    const limit = count(input.limit, 5, 8);
    const sort = text(input.sort, 20);

    const sortKey = sort === "price_asc" || sort === "price_desc" ? sort : undefined;
    const find = (bounds: string[], order?: "price_asc" | "price_desc", first = limit) =>
      // The query is assembled here from vetted parts, so filterProducts' raw syntax is safe.
      filterProducts({
        query: [terms, "available_for_sale:true", ...bounds].join(" "),
        first,
        sort: order,
        locale,
      });

    const within = [
      ...(min !== null ? [`variants.price:>=${min}`] : []),
      ...(max !== null ? [`variants.price:<=${max}`] : []),
    ];
    const exact = await find(within, sortKey, BAND_POOL_SIZE);
    if (exact.length > 0) {
      return {
        currency: exact[0].price.currencyCode,
        products: exact.slice(0, limit).map((p) => summarize(p, pool)),
        price_bands: priceBands(exact.map((p) => p.price.amount)),
      };
    }
    if (within.length === 0) {
      return { products: [], note: "No in-stock matches. Try broader or different keywords." };
    }

    // Nearest to the budget: cheapest above a ceiling, or dearest below a floor.
    const beyond =
      max !== null
        ? await find([`variants.price:>${max}`], "price_asc", BAND_POOL_SIZE)
        : await find([`variants.price:<${min}`], "price_desc", BAND_POOL_SIZE);
    return {
      products: [],
      no_exact_matches: true,
      note: "Nothing in stock within the budget. Do not show closest_matches until the shopper agrees. Offer price_bands as chips instead.",
      currency: beyond[0]?.price.currencyCode ?? null,
      closest_matches: beyond.slice(0, 4).map((p) => summarize(p, pool)),
      price_bands: priceBands(beyond.map((p) => p.price.amount)),
    };
  },
};

const budgetOptions: Tool = {
  definition: {
    name: "budget_options",
    description:
      "For an intent-based request (a gift for someone, an occasion) whose budget is too low or unknown: shows, for each category that FITS the intent, where it starts in price and a ready price range that returns real pieces. Pass only fitting categories, e.g. necklace, pendant, bracelet, earrings, ring for a gift; never accessories or categories that do not fit the shopper. An optional theme (e.g. \"mother\") is tried first per category.",
    input_schema: {
      type: "object",
      properties: {
        categories: { type: "array", items: { type: "string" }, description: "1–5 singular category keywords." },
        theme: { type: ["string", "null"], description: 'Recipient/occasion keyword such as "mother", or null.' },
        max_price: { type: ["number", "null"], description: "The shopper's budget, or null." },
      },
      required: ["categories", "theme", "max_price"],
      additionalProperties: false,
    },
    strict: true,
  },
  async run(input, { locale, pool }) {
    const categories = (Array.isArray(input.categories) ? input.categories : [])
      .map((c) => toSearchTerms(text(c, 40)))
      .filter(Boolean)
      .slice(0, 5);
    if (categories.length === 0) return { error: "no categories" };
    const theme = toSearchTerms(text(input.theme, 40));
    const max = price(input.max_price);
    const cheapestFirst = (words: string) =>
      filterProducts({ query: `${words} available_for_sale:true`, first: 12, sort: "price_asc", locale });

    const options = await Promise.all(
      categories.map(async (category) => {
        // Themed pieces first ("mother necklace"); the plain category if none exist.
        let items = theme ? await cheapestFirst(`${theme} ${category}`) : [];
        const themed = items.length > 0;
        if (!themed) items = await cheapestFirst(category);
        if (items.length === 0) return null;

        const prices = items.map((p) => p.price.amount);
        const cheapest = prices[0];
        // Cover the first few pieces, but not a far outlier (one 16,300 piece must not stretch a 2,650 range).
        const reference = Math.max(...prices.slice(0, 3).filter((v) => v <= cheapest * 2.5));
        const step = niceStep(reference);
        let to = Math.ceil(reference / step) * step;
        if (to <= cheapest) to = cheapest + step;
        return {
          category,
          themed,
          cheapest,
          from: cheapest,
          to,
          pieces_in_range: prices.filter((v) => v <= to).length,
          within_budget: max !== null ? prices.filter((v) => v <= max).length : null,
          currency: items[0].price.currencyCode,
          cheapest_ref: refFor(items[0], pool),
        };
      }),
    );
    return {
      options: options.filter((o) => o !== null).sort((a, b) => a.cheapest - b.cheapest),
      note: "Offer the fitting categories as chips like \"Bracelets from AED 700\"; each chip's message must ask for that category for the shopper's recipient/occasion between from and to. Do not show pieces until one is chosen.",
    };
  },
};

const browseCollection: Tool = {
  definition: {
    name: "browse_collection",
    description:
      "Browse the live catalog without keywords: best sellers, new arrivals, or a named collection (handle from list_collections).",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["best_sellers", "new_arrivals", "collection"] },
        handle: { type: ["string", "null"], description: "Required when kind is collection." },
        limit: { type: "integer", description: "1–8." },
      },
      required: ["kind", "handle", "limit"],
      additionalProperties: false,
    },
    strict: true,
  },
  async run(input, { locale, pool }) {
    const kind = text(input.kind, 20);
    const first = count(input.limit, 5, 8);
    let products: Product[];
    if (kind === "collection") {
      const handle = text(input.handle);
      if (!/^[a-z0-9-]+$/i.test(handle)) return { error: "invalid collection handle" };
      products = await getCollectionProducts({ handle, first: first * 2, locale });
    } else {
      products = await getProducts({
        first: first * 2,
        sortKey: kind === "new_arrivals" ? "CREATED_AT" : "BEST_SELLING",
        reverse: kind === "new_arrivals",
        locale,
      });
    }
    const inStock = products.filter((p) => p.available).slice(0, first);
    return inStock.length > 0
      ? { products: inStock.map((p) => summarize(p, pool)) }
      : { products: [], note: "Nothing available to show here right now." };
  },
};

const listCollections: Tool = {
  definition: {
    name: "list_collections",
    description: "List Jawhara's collections and categories (title and handle) for browse_collection.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run(_input, { locale }) {
    return { collections: flattenCollections(await getMenu(MAIN_MENU_HANDLE, locale)).slice(0, 60) };
  },
};

const getProductDetails: Tool = {
  definition: {
    name: "get_product_details",
    description:
      "Full details for one product by handle (description, variants with price and stock, specifications). Use for questions about a specific piece.",
    input_schema: {
      type: "object",
      properties: { handle: { type: "string" } },
      required: ["handle"],
      additionalProperties: false,
    },
    strict: true,
  },
  async run(input, { locale, pool }) {
    const handle = text(input.handle);
    if (!/^[a-z0-9-]+$/i.test(handle)) return { error: "invalid handle" };
    const product = await getProductByHandle(handle, locale);
    if (!product) return { error: "product not found" };
    return {
      ...summarize(product, pool),
      description: plainText(product.description, 700),
      designCode: product.designCode,
      specifications: product.specifications.map((s) => `${s.label}: ${s.value}`),
      variants: product.variants.slice(0, 12).map((v) => ({
        title: v.title,
        available: v.available,
        price: v.price.amount,
      })),
    };
  },
};

const getStorePolicy: Tool = {
  definition: {
    name: "get_store_policy",
    description: "The store's official policy text: returns/refunds, shipping, privacy or terms.",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string", enum: ["returns", "shipping", "privacy", "terms"] } },
      required: ["topic"],
      additionalProperties: false,
    },
    strict: true,
  },
  async run(input, { locale }) {
    const handle: PolicyHandle =
      ({ returns: "refund-policy", shipping: "shipping-policy", privacy: "privacy-policy", terms: "terms-of-service" } as const)[
        text(input.topic, 20) as "returns"
      ] ?? "refund-policy";
    // Same precedence as the policy pages: Shopify wins, static copy fills gaps.
    const policy =
      (POLICY_HANDLES.includes(handle) ? await getShopPolicy(handle, locale) : null) ??
      (STATIC_POLICIES[handle] ? toContentPage(handle, STATIC_POLICIES[handle]) : null);
    return policy
      ? { title: policy.title, text: plainText(policy.bodyHtml) }
      : { error: "This policy text is not published. For returns and exchanges, use get_faq." };
  },
};

const getFaq: Tool = {
  definition: {
    name: "get_faq",
    description:
      "Jawhara's frequently asked questions and answers (care, orders, payments, certificates, services). Check here for general how-it-works questions.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run() {
    return {
      faq: FAQ_PAGE.groups.flatMap((group) =>
        group.items.map((item) => ({
          topic: group.heading,
          question: item.q,
          answer: plainText(item.a.join(" "), 600),
        })),
      ),
    };
  },
};

const getDeliveryInfo: Tool = {
  definition: {
    name: "get_delivery_info",
    description:
      "Same-day/next-day delivery rules and the current order cutoff. For other destinations or timings, also read the shipping policy.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run() {
    const past = isPastSameDayCutoff();
    return {
      same_day_emirates: SAME_DAY_EMIRATES,
      cutoff: `${SAME_DAY_CUTOFF_HOUR}:00 Dubai time`,
      past_cutoff_now: past,
      rule: past
        ? "Orders placed now for same-day emirates ship next day; other emirates follow the standard timing."
        : "Orders placed before the cutoff for same-day emirates are delivered the same day; other emirates follow the standard timing.",
      other_destinations: "Not specified here — read the shipping policy; do not guess.",
      applies_to: "In-stock items only.",
    };
  },
};

const getStoreLocationsTool: Tool = {
  definition: {
    name: "get_store_locations",
    description: "Jawhara's physical stores with address, phone and opening hours.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run(_input, { locale }) {
    const stores = await getStoreLocations(locale);
    return {
      stores: stores.slice(0, 25).map(({ name, address, region, country, phone, hours }) => ({
        name, address, region, country, phone, hours,
      })),
    };
  },
};

const getGoldPriceTool: Tool = {
  definition: {
    name: "get_gold_price",
    description:
      "Today's international gold spot price in AED per gram for 24K, 22K, 21K, 18K and 14K. A reference rate only: Jawhara's jewellery prices also include making charges, stones and VAT.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run(_input, { gold }) {
    const snapshot = await getGoldPrices();
    gold.value = snapshot;
    return {
      ...snapshot,
      note: "International spot reference, not Jawhara's selling price. Set show_gold_card to true in respond to display the rate card.",
    };
  },
};

const getContactInfo: Tool = {
  definition: {
    name: "get_contact_info",
    description: "Customer-service phone, WhatsApp and email.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  async run() {
    return {
      phone: contact.phone.display,
      whatsapp: contact.whatsapp.display,
      email: contact.serviceEmail,
    };
  },
};

export const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description:
    "Send your final reply to the shopper. Call exactly once, last, after any lookups. Product refs must come from tool results in this conversation.",
  input_schema: {
    type: "object",
    properties: {
      message: { type: "string", description: "1–3 short sentences, plain text." },
      product_refs: { type: "array", items: { type: "string" }, description: 'Refs like "p1" from tool results, up to 5.' },
      actions: {
        type: "array",
        description: "2–4 quick-reply chips.",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Short chip text." },
            message: { type: "string", description: "Sent as the shopper's next message." },
          },
          required: ["label", "message"],
          additionalProperties: false,
        },
      },
      link_ids: { type: "array", items: { type: "string", enum: [...LAYLA_LINK_IDS] }, description: "Up to 3." },
      show_gold_card: { type: "boolean", description: "True only after get_gold_price, to show today's rate card." },
    },
    required: ["message", "product_refs", "actions", "link_ids", "show_gold_card"],
    additionalProperties: false,
  },
  strict: true,
};

const TOOLS: Tool[] = [
  searchProducts,
  budgetOptions,
  browseCollection,
  listCollections,
  getProductDetails,
  getStorePolicy,
  getFaq,
  getDeliveryInfo,
  getStoreLocationsTool,
  getGoldPriceTool,
  getContactInfo,
];

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [...TOOLS.map((t) => t.definition), RESPOND_TOOL];

export async function runTool(
  name: string,
  input: unknown,
  ctx: ToolContext,
): Promise<{ content: string; isError: boolean }> {
  const tool = TOOLS.find((t) => t.definition.name === name);
  if (!tool) return { content: JSON.stringify({ error: `unknown tool ${name}` }), isError: true };
  try {
    const result = await tool.run((input ?? {}) as Record<string, unknown>, ctx);
    return { content: JSON.stringify(result), isError: false };
  } catch (error) {
    console.error(`[layla] tool ${name} failed`, error);
    return { content: JSON.stringify({ error: "This lookup is temporarily unavailable." }), isError: true };
  }
}
