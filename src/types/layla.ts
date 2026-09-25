import type { Product } from "@/types/product";

/** Links Layla may attach to a reply. She names an id; the server resolves the
 * real URL, so she can never hand a shopper an invented or off-site address. */
export const LAYLA_LINK_IDS = [
  "faq",
  "shipping_policy",
  "store_locator",
  "customer_service",
  "whatsapp",
  "phone",
  "account",
  "all_jewellery",
] as const;
export type LaylaLinkId = (typeof LAYLA_LINK_IDS)[number];

export type ChatTurn = { role: "user" | "assistant"; content: string };

/** Only what a chat card renders — never the full variant/image list. */
export type ChatProduct = Pick<
  Product,
  "id" | "handle" | "title" | "available" | "image" | "price" | "compareAtPrice" | "rating" | "tags"
>;

/** A quick-reply chip: `label` is shown, `message` is sent as the shopper's next turn. */
export type ChatAction = { label: string; message: string };

/** Today's spot rate, in AED per gram by karat — see services/gold-price.ts. */
export type ChatGold = { prices: { karat: string; perGram: number }[]; currency: string; updatedAt: string };

export type ChatLink = { id: LaylaLinkId; label: string; href: string };

/** The fixed contract between the agent and the UI — the model never emits markup. */
export type ChatReply = {
  message: string;
  products: ChatProduct[];
  actions: ChatAction[];
  links: ChatLink[];
  /** Present only when Layla fetched today's gold price for this reply. */
  gold?: ChatGold;
};

export type ChatRequest = { messages: ChatTurn[] };

/** What the chat route streams, one JSON object per line. Partial `message`
 * events let the reply appear as it is written; `reply` is the final, validated
 * result and always replaces whatever was streamed. */
export type LaylaStatusKind = "searching" | "gold" | "lookup";
export type LaylaEvent =
  | { type: "status"; kind: LaylaStatusKind }
  | { type: "message"; text: string }
  | { type: "reply"; reply: ChatReply }
  | { type: "error" };
