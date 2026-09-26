import Anthropic from "@anthropic-ai/sdk";
import { contact } from "@/config/contact";
import { ALL_PRODUCTS_HANDLE } from "@/config/catalog";
import type { Locale } from "@/config/i18n";
import { LAYLA_LIMITS, LAYLA_MODEL } from "@/config/layla";
import { shopifyConfig } from "@/config/shopify";
import type { Dictionary } from "@/dictionaries";
import { LAYLA_SYSTEM_PROMPT } from "@/services/layla/prompt";
import { RESPOND_TOOL, runTool, TOOL_DEFINITIONS, type GoldHolder, type ProductPool } from "@/services/layla/tools";
import {
  LAYLA_LINK_IDS,
  type ChatAction,
  type ChatLink,
  type ChatProduct,
  type ChatReply,
  type ChatTurn,
  type LaylaEvent,
  type LaylaLinkId,
  type LaylaStatusKind,
} from "@/types/layla";

let client: Anthropic | undefined;
const getClient = () => (client ??= new Anthropic({ maxRetries: 1, timeout: 45_000 }));

const LINK_HREFS: Record<LaylaLinkId, string> = {
  faq: "/pages/faq",
  shipping_policy: "/policies/shipping-policy",
  store_locator: "/stores",
  customer_service: "/customer-service",
  whatsapp: contact.whatsapp.href,
  phone: contact.phone.href,
  account: shopifyConfig.accountUrl,
  all_jewellery: `/collections/${ALL_PRODUCTS_HANDLE}`,
};

const STATUS_BY_TOOL: Record<string, LaylaStatusKind> = {
  search_products: "searching",
  browse_collection: "searching",
  list_collections: "searching",
  get_product_details: "searching",
  budget_options: "searching",
  get_gold_price: "gold",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function toChatProduct(product: ChatProduct): ChatProduct {
  const { id, handle, title, available, image, price, compareAtPrice, rating, tags } = product;
  // Tags only drive the card's badge, so a handful is plenty.
  return { id, handle, title, available, image, price, compareAtPrice, rating, tags: tags.slice(0, 12) };
}

/** Turns the model's `respond` payload into a reply the UI can trust: unknown
 * product handles, links and malformed chips are dropped, not rendered. */
function buildReply(input: unknown, pool: ProductPool, gold: GoldHolder, t: Dictionary["layla"]): ChatReply {
  const raw = isRecord(input) ? input : {};
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  const refs = Array.isArray(raw.product_refs) ? raw.product_refs : [];
  const products = [...new Set(refs)]
    .flatMap((ref) => {
      const product = typeof ref === "string" ? pool.get(ref) : undefined;
      return product ? [toChatProduct(product)] : [];
    })
    .slice(0, LAYLA_LIMITS.maxProductsPerReply);

  const actions: ChatAction[] = (Array.isArray(raw.actions) ? raw.actions : [])
    .flatMap((action) => {
      if (!isRecord(action)) return [];
      const label = typeof action.label === "string" ? action.label.trim().slice(0, 40) : "";
      const text = typeof action.message === "string" ? action.message.trim().slice(0, 200) : "";
      return label && text ? [{ label, message: text }] : [];
    })
    .slice(0, 4);

  const links: ChatLink[] = [...new Set(Array.isArray(raw.link_ids) ? raw.link_ids : [])]
    .flatMap((id) =>
      (LAYLA_LINK_IDS as readonly unknown[]).includes(id)
        ? [{ id: id as LaylaLinkId, label: t.links[id as LaylaLinkId], href: LINK_HREFS[id as LaylaLinkId] }]
        : [],
    )
    .slice(0, 3);

  // The card only ever shows a rate a tool actually fetched this turn.
  const card = raw.show_gold_card === true && gold.value ? { gold: gold.value } : {};
  return { message: message || t.fallbackReply, products, actions, links, ...card };
}

const fallbackReply = (t: Dictionary["layla"], message: string): ChatReply => ({
  message,
  products: [],
  actions: [],
  links: [
    { id: "customer_service", label: t.links.customer_service, href: LINK_HREFS.customer_service },
  ],
});

/**
 * One shopper message → one structured reply. Claude decides which lookups to
 * run; this code runs them against Shopify and only lets products that a tool
 * actually returned reach the UI.
 */
export async function runLayla({
  history,
  locale,
  dictionary,
  onEvent,
}: {
  history: ChatTurn[];
  locale: Locale;
  dictionary: Dictionary["layla"];
  /** Progress for the UI: what Layla is doing, and her reply as it is written. */
  onEvent?: (event: Exclude<LaylaEvent, { type: "reply" | "error" }>) => void;
}): Promise<ChatReply> {
  const pool: ProductPool = new Map();
  const gold: GoldHolder = { value: null };
  const messages: Anthropic.MessageParam[] = history.map(({ role, content }) => ({ role, content }));

  let askedForChips = false;

  for (let round = 0; round < LAYLA_LIMITS.maxToolRounds; round++) {
    const stream = getClient().messages.stream({
      model: LAYLA_MODEL,
      max_tokens: LAYLA_LIMITS.maxOutputTokens,
      // Haiku 4.5 rejects `effort`.
      ...(LAYLA_MODEL.startsWith("claude-haiku") ? {} : { output_config: { effort: "low" as const } }),
      // Caches the growing conversation too, so tool rounds 2+ re-read it at cache price.
      cache_control: { type: "ephemeral" },
      system: [
        // Stable prefix (tools + this block) is cached across every conversation.
        { type: "text", text: LAYLA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        {
          type: "text",
          text: `Site language: ${locale === "ar" ? "Arabic" : "English"}. Use it for your first reply unless the shopper writes in the other language.`,
        },
      ],
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Which tool call is being written right now, so only the final `respond`
    // reply is streamed to the shopper — lookups just report a status.
    let writing: string | null = null;
    stream.on("streamEvent", (event) => {
      if (event.type !== "content_block_start") return;
      writing = event.content_block.type === "tool_use" ? event.content_block.name : null;
      const status = writing ? STATUS_BY_TOOL[writing] ?? (writing !== RESPOND_TOOL.name ? "lookup" : null) : null;
      if (status) onEvent?.({ type: "status", kind: status });
    });
    stream.on("inputJson", (_delta, snapshot) => {
      const text = writing === RESPOND_TOOL.name && isRecord(snapshot) ? snapshot.message : null;
      if (typeof text === "string" && text) onEvent?.({ type: "message", text });
    });
    const response = await stream.finalMessage();
    const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } = response.usage;
    console.info(
      `[layla] round=${round + 1} in=${input_tokens} cache_read=${cache_read_input_tokens ?? 0} cache_write=${cache_creation_input_tokens ?? 0} out=${output_tokens}`,
    );

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return fallbackReply(dictionary, dictionary.fallbackReply);
    }

    const calls = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (calls.length === 0) {
      // The model answered in plain text instead of calling respond: keep the words, show no products.
      const plain = response.content
        .flatMap((block) => (block.type === "text" ? [block.text.trim()] : []))
        .join(" ")
        .trim();
      return { message: plain || dictionary.fallbackReply, products: [], actions: [], links: [] };
    }

    const lookups = calls.filter((call) => call.name !== RESPOND_TOOL.name);
    const respond = calls.find((call) => call.name === RESPOND_TOOL.name);
    if (respond && lookups.length === 0) {
      const reply = buildReply(respond.input, pool, gold, dictionary);
      // A question without tappable answers makes the shopper type. Send it back once to be fixed.
      const asksWithoutChips =
        /[?؟]/.test(reply.message) && reply.actions.length < 2 && reply.products.length === 0 && !reply.gold;
      if (!asksWithoutChips || askedForChips) return reply;
      askedForChips = true;
      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: respond.id,
            is_error: true,
            content:
              "Your message asks the shopper a question but offers fewer than 2 chips. Call respond again: ask ONE question (not two) and give 2–4 tappable chips that answer it, each a complete message.",
          },
        ],
      });
      continue;
    }

    messages.push({ role: "assistant", content: response.content });
    const results = await Promise.all(
      calls.map(async (call): Promise<Anthropic.ToolResultBlockParam> => {
        // respond alongside lookups would cite products it hasn't seen yet — make it retry.
        if (call.name === RESPOND_TOOL.name) {
          return {
            type: "tool_result",
            tool_use_id: call.id,
            is_error: true,
            content: "Call respond only after you have the lookup results. Try again.",
          };
        }
        const { content, isError } = await runTool(call.name, call.input, { locale, pool, gold });
        return { type: "tool_result", tool_use_id: call.id, content, is_error: isError };
      }),
    );
    messages.push({ role: "user", content: results });
  }

  return fallbackReply(dictionary, dictionary.fallbackReply);
}
