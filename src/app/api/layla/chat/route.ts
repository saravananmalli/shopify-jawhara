import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, defaultLocale } from "@/config/i18n";
import { isLaylaConfigured, LAYLA_LIMITS } from "@/config/layla";
import { getDictionary } from "@/dictionaries";
import { runLayla } from "@/services/layla/agent";
import { checkRateLimit } from "@/services/layla/rate-limit";
import type { ChatTurn, LaylaEvent } from "@/types/layla";

export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };
const fail = (status: number, code: string) =>
  NextResponse.json({ error: code }, { status, headers: NO_STORE });

/** Keeps the last turns, drops anything that isn't plain user/assistant text,
 * and guarantees the conversation starts and ends on a shopper turn. */
function sanitizeHistory(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value)) return null;
  const turns: ChatTurn[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const trimmed = content.trim();
    if (trimmed) turns.push({ role, content: trimmed.slice(0, LAYLA_LIMITS.maxTurnChars) });
  }
  const recent = turns.slice(-LAYLA_LIMITS.maxHistoryTurns);
  while (recent[0]?.role === "assistant") recent.shift();
  const last = recent.at(-1);
  if (!last || last.role !== "user" || last.content.length > LAYLA_LIMITS.maxMessageChars) return null;
  return recent;
}

export async function POST(request: NextRequest) {
  if (!isLaylaConfigured()) return fail(503, "unavailable");

  // Browsers always send Origin on a cross-site POST; refuse other sites spending our API budget.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return fail(403, "forbidden");

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!checkRateLimit(ip)) return fail(429, "rate_limited");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > LAYLA_LIMITS.maxRequestBytes) return fail(413, "too_large");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_request");
  }
  const history = sanitizeHistory((body as { messages?: unknown } | null)?.messages);
  if (!history) return fail(400, "invalid_request");

  // The shopper's language, from the same cookie the proxy uses; /ar pages set it.
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const referer = request.headers.get("referer") ?? "";
  const locale = isLocale(cookie)
    ? cookie
    : new URL(referer, request.nextUrl.origin).pathname.startsWith("/ar")
      ? "ar"
      : defaultLocale;

  // Streamed as newline-delimited JSON so the shopper sees progress and the
  // reply as it is written, instead of waiting out both model round trips.
  const encoder = new TextEncoder();
  const output = new ReadableStream({
    async start(controller) {
      const send = (event: LaylaEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const { layla } = await getDictionary(locale);
        const reply = await runLayla({ history, locale, dictionary: layla, onEvent: send });
        send({ type: "reply", reply });
      } catch (error) {
        console.error("[layla] chat failed", error);
        send({ type: "error" });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(output, {
    headers: { ...NO_STORE, "Content-Type": "application/x-ndjson; charset=utf-8", "X-Accel-Buffering": "no" },
  });
}
