/**
 * Layla — the AI jewellery consultant. Deliberately fixed to Sonnet: it is not
 * overridable by env so a stray setting can't quietly move the chat to another model.
 */
export const LAYLA_MODEL = "claude-sonnet-5";

/** Server-only secret — deliberately not NEXT_PUBLIC_. */
export function isLaylaConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** The launcher shows once a key is set; in dev it always shows so the UI can be
 * built and reviewed (the chat then reports itself unavailable instead of answering). */
export function isLaylaVisible(): boolean {
  return isLaylaConfigured() || process.env.NODE_ENV !== "production";
}

export const LAYLA_LIMITS = {
  /** Characters a shopper may type in one message. */
  maxMessageChars: 500,
  /** Turns of history sent back to the model. */
  maxHistoryTurns: 14,
  /** Cap per history turn (assistant turns carry a product-context note). */
  maxTurnChars: 1200,
  maxRequestBytes: 24_000,
  /** Model ↔ tool round trips per shopper message. */
  maxToolRounds: 5,
  maxOutputTokens: 1024,
  maxProductsPerReply: 5,
  /** Best-effort per-instance throttle; serverless instances don't share it. */
  rateLimit: { windowMs: 5 * 60_000, max: 20 },
} as const;
