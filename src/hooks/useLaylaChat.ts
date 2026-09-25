"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAYLA_LIMITS } from "@/config/layla";
import type {
  ChatAction,
  ChatGold,
  ChatLink,
  ChatProduct,
  ChatTurn,
  LaylaEvent,
  LaylaStatusKind,
} from "@/types/layla";

export type LaylaMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  products: ChatProduct[];
  actions: ChatAction[];
  links: ChatLink[];
  gold?: ChatGold;
};

export type LaylaError = "generic" | "rate_limited" | "unavailable";

const ERROR_BY_STATUS: Record<number, LaylaError> = { 429: "rate_limited", 503: "unavailable" };

/** What the model is sent for an earlier reply: the words plus which pieces the
 * shopper saw, so "the second one" or "cheaper ones" has something to refer to. */
function toTurn({ role, content, products }: LaylaMessage): ChatTurn {
  const shown = products.map((p) => `${p.title} (${p.handle})`).join(", ");
  return { role, content: shown ? `${content}\n[Shown: ${shown}]` : content };
}

/** Conversation state for the Layla chat. Lives for the page session only —
 * nothing is stored, and history is re-sent to the server on every turn. */
export function useLaylaChat() {
  const [messages, setMessages] = useState<LaylaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LaylaError | null>(null);
  /** Reply text as it is being written, and what Layla is currently doing. */
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<LaylaStatusKind | null>(null);
  const nextId = useRef(0);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const request = useCallback(async (history: LaylaMessage[]) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(null);
    setDraft("");
    setStatus(null);
    try {
      const res = await fetch("/api/layla/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(toTurn) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        setError(ERROR_BY_STATUS[res.status] ?? "generic");
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffered = "";
      let finished = false;
      const handle = (event: LaylaEvent) => {
        if (event.type === "status") setStatus(event.kind);
        else if (event.type === "message") setDraft(event.text);
        else if (event.type === "error") setError("generic");
        else {
          finished = true;
          const { reply } = event;
          setMessages((current) => [
            ...current,
            {
              id: nextId.current++,
              role: "assistant",
              content: reply.message,
              products: reply.products,
              actions: reply.actions,
              links: reply.links,
              gold: reply.gold,
            },
          ]);
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffered += value;
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) handle(JSON.parse(line) as LaylaEvent);
      }
      if (!finished) setError((current) => current ?? "generic");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("generic");
    } finally {
      if (abort.current === controller) {
        setLoading(false);
        setDraft("");
        setStatus(null);
      }
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const content = text.trim().slice(0, LAYLA_LIMITS.maxMessageChars);
      if (!content || loading) return;
      const next: LaylaMessage[] = [
        ...messages,
        { id: nextId.current++, role: "user", content, products: [], actions: [], links: [] },
      ];
      setMessages(next);
      void request(next);
    },
    [loading, messages, request],
  );

  const retry = useCallback(() => {
    if (!loading && messages.at(-1)?.role === "user") void request(messages);
  }, [loading, messages, request]);

  const reset = useCallback(() => {
    abort.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
    setDraft("");
    setStatus(null);
  }, []);

  return { messages, loading, error, draft, status, send, retry, reset };
}
