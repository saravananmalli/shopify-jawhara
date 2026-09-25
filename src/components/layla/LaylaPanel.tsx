"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "@/components/ui/Link";
import DialogOverlay from "@/components/ui/DialogOverlay";
import LaylaProductCard from "@/components/layla/LaylaProductCard";
import LaylaAvatar from "@/components/layla/LaylaAvatar";
import {
  BagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GiftIcon,
  HeartIcon,
  PackageIcon,
  PaperPlaneIcon,
  SparkleIcon,
  TrendingIcon,
} from "@/components/icons";
import { SocialIcon } from "@/components/SocialIcons";
import { contact } from "@/config/contact";
import { shopifyConfig } from "@/config/shopify";
import { useCart } from "@/store/cart";
import { LAYLA_LIMITS } from "@/config/layla";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLaylaChat, type LaylaMessage } from "@/hooks/useLaylaChat";
import { useDictionary, useLocale } from "@/store/locale";
import { INTL_LOCALE } from "@/utils/format";
import { formatMessage } from "@/utils/i18n";
import type { ChatAction, ChatGold } from "@/types/layla";

const CHIP =
  "rounded-full border border-[#E6D7BE] bg-cream-100 px-3.5 py-1.5 text-[11px] font-medium text-gold-700 transition-colors hover:border-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600";

const STARTER_ICONS = [GiftIcon, TrendingIcon, SparkleIcon];

const TILE =
  "group flex flex-col items-center gap-3 rounded-2xl border border-[#E6D7BE] bg-white px-1.5 py-3.5 text-center text-[11px] font-semibold leading-snug tracking-wide text-brown-900 transition-[border-color,box-shadow] duration-300 ease-luxury hover:border-gold-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 rtl:tracking-normal";
const TILE_ICON =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[#E6D7BE] bg-cream-100 text-gold-600 transition-colors duration-300 group-hover:bg-gold-50";

/** Horizontal strip of pieces: native swipe/scroll-snap on touch, edge arrows for
 * mouse users. Direction-aware — scrollLeft is negative in RTL. */
function Carousel({ label, children }: { label: string; children: React.ReactNode }) {
  const { layla: t } = useDictionary();
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const offset = Math.abs(el.scrollLeft);
    setEdges({ start: offset < 4, end: offset + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const scroll = (forward: boolean) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const sign = (forward ? 1 : -1) * (rtl ? -1 : 1);
    el.scrollBy({ left: sign * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow =
    "absolute top-[38%] z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-[#E6D7BE] bg-white text-gold-700 shadow-md transition-opacity hover:border-gold-600 focus-visible:outline-2 focus-visible:outline-gold-600 md:flex";

  return (
    <div className="relative -mx-4">
      <ul
        ref={ref}
        aria-label={label}
        onScroll={update}
        className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {!edges.start && (
        <button type="button" aria-label={t.scrollPrev} onClick={() => scroll(false)} className={`${arrow} start-1.5`}>
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}
      {!edges.end && (
        <button type="button" aria-label={t.scrollNext} onClick={() => scroll(true)} className={`${arrow} end-1.5`}>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Today's rate by karat, with the follow-up chips inside the card. The figures
 * come from the server-side gold tool, never from the model's text. */
function GoldCard({
  gold,
  actions,
  showActions,
  onSend,
}: {
  gold: ChatGold;
  actions: ChatAction[];
  showActions: boolean;
  onSend: (text: string) => void;
}) {
  const { layla: t } = useDictionary();
  const locale = useLocale();
  const number = new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const relative = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto" });
  // "Now" is fixed when the card appears, so the label doesn't drift on re-render.
  const [now] = useState(() => Date.now());
  const minutes = Math.max(0, Math.round((now - new Date(gold.updatedAt).getTime()) / 60_000));
  const ago = minutes < 1 ? t.justNow : minutes < 60 ? relative.format(-minutes, "minute") : relative.format(-Math.round(minutes / 60), "hour");

  return (
    <section aria-label={t.goldTitle} className="min-w-0 flex-1 overflow-hidden rounded-2xl rounded-ss-md border border-gold-100 bg-white shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-cream-100 px-4 py-3 text-[13px] font-medium text-brown-900">
        <SparkleIcon className="h-3.5 w-3.5 text-gold-400" />
        {t.goldTitle}
      </h3>
      <dl className="divide-y divide-cream-100 px-4">
        {gold.prices.map(({ karat, perGram }) => (
          <div key={karat} className="flex items-center gap-3 py-2.5">
            <dt className="w-9 text-[13px] font-bold text-brown-800">{karat}</dt>
            <span aria-hidden className="h-1 w-1 rounded-full bg-gold-100" />
            <dd dir="ltr" className="ms-auto text-[13px] font-semibold tabular-nums text-brown-900">
              {gold.currency} {number.format(perGram)}
              <span className="font-normal text-brown-900/45">/g</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-cream-100 px-4 py-2.5 text-center text-[11px] leading-snug text-brown-900/55">
        {formatMessage(t.goldUpdated, { time: ago })}
        <span className="block text-brown-900/45">{t.goldNote}</span>
      </p>
      {showActions && actions.length > 0 && (
        <div className="border-t border-cream-100 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brown-900/55 rtl:tracking-normal">
            {t.goldPrefer}
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <button key={action.label} type="button" className={CHIP} onClick={() => onSend(action.message)}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** While Layla works: her avatar beside a shimmering placeholder reply and what she is doing. */
function TypingIndicator({ label }: { label: string }) {
  const line = "h-2.5 animate-pulse rounded-full bg-[linear-gradient(90deg,var(--color-cream-100),var(--color-gold-100))]";
  return (
    <div role="status" className="flex items-start gap-3">
      <LaylaAvatar size="sm" />
      <div className="w-64 max-w-[85%] rounded-2xl rounded-ss-md border border-gold-100 bg-white px-4 py-3.5 shadow-sm">
        <div aria-hidden className="flex flex-col gap-2">
          <span className={`${line} w-full`} />
          <span className={`${line} w-full`} style={{ animationDelay: "150ms" }} />
          <span className={`${line} w-1/2`} style={{ animationDelay: "300ms" }} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-[13px] text-brown-900/60">
          <SparkleIcon className="h-3.5 w-3.5 animate-pulse text-gold-600" />
          {label}
        </p>
      </div>
    </div>
  );
}

function Message({
  message,
  showActions,
  onSend,
  onNavigate,
}: {
  message: LaylaMessage;
  showActions: boolean;
  onSend: (text: string) => void;
  onNavigate: () => void;
}) {
  const { layla: t } = useDictionary();

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p
          dir="auto"
          className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-ee-md bg-gold-600 px-4 py-2.5 text-[13px] leading-relaxed text-white"
        >
          <span className="sr-only">{t.youSaid}: </span>
          {message.content}
        </p>
      </div>
    );
  }

  if (message.gold) {
    return (
      <div id={`layla-msg-${message.id}`} className="flex items-start gap-3">
        <LaylaAvatar size="sm" />
        <GoldCard gold={message.gold} actions={message.actions} showActions={showActions} onSend={onSend} />
      </div>
    );
  }

  return (
    <div id={`layla-msg-${message.id}`} className="flex flex-col gap-3">
      <p
        dir="auto"
        className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-ss-md border border-gold-100 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-brown-900"
      >
        <span className="sr-only">{t.laylaSaid}: </span>
        {message.content}
      </p>

      {message.products.length > 0 && (
        <Carousel label={t.recommended}>
          {message.products.map((product) => (
            <li key={product.handle} className="flex">
              <LaylaProductCard product={product} onNavigate={onNavigate} />
            </li>
          ))}
        </Carousel>
      )}

      {message.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={onNavigate}
              className="rounded-full border border-gold-600 px-3.5 py-1.5 text-[11px] font-semibold text-gold-700 transition-colors hover:bg-gold-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {showActions && message.actions.length > 0 && (
        <div role="group" aria-label={t.suggestions} className="flex flex-wrap gap-2">
          {message.actions.map((action) => (
            <button key={action.label} type="button" className={CHIP} onClick={() => onSend(action.message)}>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LaylaPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { layla: t } = useDictionary();
  const { messages, loading, error, draft: streamed, status, send, retry, reset } = useLaylaChat();
  const { openCart } = useCart();
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, visible, onClose);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    // A new reply is read from its first line; a spinner or error sits at the end.
    const last = messages.at(-1);
    const reply = last?.role === "assistant" && !loading && !error
      ? log.querySelector<HTMLElement>(`#layla-msg-${last.id}`)
      : null;
    // The welcome screen always starts at its title.
    const top = messages.length === 0 ? 0 : reply ? reply.offsetTop - 16 : log.scrollHeight;
    log.scrollTo({ top, behavior });
  }, [messages, loading, error, streamed]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || loading) return;
    send(draft);
    setDraft("");
  };
  const sendText = (text: string) => {
    send(text);
    inputRef.current?.focus();
  };

  const lastAssistantId = messages.findLast((m) => m.role === "assistant")?.id;
  const errorText =
    error === "rate_limited" ? t.errorRateLimited : error === "unavailable" ? t.errorUnavailable : t.errorGeneric;

  return (
    <DialogOverlay visible={visible} onClose={onClose} scrimClassName="bg-black/40 md:bg-transparent">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className={`absolute inset-0 flex flex-col bg-cream-50 shadow-2xl transition-[transform,opacity] duration-300 ease-luxury md:inset-auto md:bottom-6 md:end-6 md:h-[min(45rem,calc(100dvh-3rem))] md:w-[30rem] md:rounded-3xl md:border md:border-[#E6D7BE] md:shadow-[0_24px_64px_rgba(60,53,40,0.28)] ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <header className="flex items-center gap-3 bg-[linear-gradient(110deg,var(--color-gold-400),var(--color-gold-500)_55%,var(--color-brown-800))] px-4 py-3 text-white md:rounded-t-3xl">
          <LaylaAvatar size="md" online />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold leading-tight tracking-wide rtl:tracking-normal">{t.title}</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-[11px] font-bold">
                <SparkleIcon className="h-3 w-3" />
                {t.aiBadge}
              </span>
            </div>
            <p className="truncate text-xs tracking-wide text-white/90 rtl:tracking-normal">{t.subtitle}</p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-full border border-white/45 bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
            >
              {t.newChat}
            </button>
          )}
          <button
            type="button"
            aria-label={t.close}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/35 focus-visible:outline-2 focus-visible:outline-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label={t.messagesLabel}
          className="relative flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5"
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-brown-900/55 rtl:tracking-normal">
                {t.helpTitle}
              </p>
              <div role="group" aria-label={t.suggestions} className="grid grid-cols-3 gap-2.5">
                <a href={shopifyConfig.accountUrl} className={TILE}>
                  <span className={TILE_ICON}><PackageIcon className="h-6 w-6" /></span>
                  {t.orders}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openCart();
                  }}
                  className={TILE}
                >
                  <span className={TILE_ICON}><BagIcon className="h-6 w-6" /></span>
                  {t.cart}
                </button>
                <Link href="/wishlist" onClick={onClose} className={TILE}>
                  <span className={TILE_ICON}><HeartIcon className="h-6 w-6" /></span>
                  {t.wishlist}
                </Link>
                {t.starters.map((starter, index) => {
                  const Icon = STARTER_ICONS[index] ?? SparkleIcon;
                  return (
                    <button key={starter.label} type="button" onClick={() => sendText(starter.message)} className={TILE}>
                      <span className={TILE_ICON}><Icon className="h-6 w-6" /></span>
                      {starter.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-start gap-3">
                <LaylaAvatar size="sm" />
                <div className="min-w-0 flex-1 overflow-hidden rounded-2xl rounded-ss-md border border-gold-100 bg-white shadow-sm">
                  <p className="px-3.5 py-3 text-[13px] leading-relaxed tracking-wide text-brown-900 rtl:tracking-normal">
                    {t.greeting} {t.greetingBody}
                  </p>
                  <div className="flex flex-wrap gap-2 border-t border-cream-100 px-4 py-3">
                    {t.welcomeChips.map((chip) => (
                      <button key={chip.label} type="button" onClick={() => sendText(chip.message)} className={CHIP}>
                        {chip.label}
                      </button>
                    ))}
                    <a href={shopifyConfig.accountUrl} className={CHIP}>
                      {t.trackOrder}
                    </a>
                    <a
                      href={contact.whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-success-500 px-4 py-1.5 text-[11px] font-semibold text-success-700 transition-colors hover:bg-success-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-500"
                    >
                      <SocialIcon name="whatsapp" className="h-4 w-4" />
                      {t.chatWhatsapp}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              showActions={message.id === lastAssistantId && !loading && !error}
              onSend={sendText}
              onNavigate={onClose}
            />
          ))}

          {loading && streamed && (
            <p
              dir="auto"
              className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-ss-md border border-gold-100 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-brown-900"
            >
              <span className="sr-only">{t.laylaSaid}: </span>
              {streamed}
            </p>
          )}
          {loading && !streamed && (
            <TypingIndicator
              label={
                status === "searching"
                  ? t.statusSearching
                  : status === "gold"
                    ? t.statusGold
                    : status === "lookup"
                      ? t.statusLookup
                      : t.typing
              }
            />
          )}

          {error && (
            <div role="alert" className="flex flex-col items-start gap-2 rounded-2xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-700">
              <p>{errorText}</p>
              <div className="flex flex-wrap gap-2">
                {error !== "unavailable" && (
                  <button type="button" onClick={retry} className="rounded-full border border-error-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-error-700 hover:text-white focus-visible:outline-2 focus-visible:outline-error-700">
                    {t.retry}
                  </button>
                )}
                <Link
                  href="/customer-service"
                  onClick={onClose}
                  className="rounded-full border border-error-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-error-700 hover:text-white focus-visible:outline-2 focus-visible:outline-error-700"
                >
                  {t.links.customer_service}
                </Link>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-gold-100 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:rounded-b-3xl md:pb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="layla-input" className="sr-only">
              {t.inputLabel}
            </label>
            <input
              id="layla-input"
              ref={inputRef}
              type="text"
              dir="auto"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={LAYLA_LIMITS.maxMessageChars}
              placeholder={t.placeholder}
              autoComplete="off"
              enterKeyHint="send"
              className="min-w-0 flex-1 rounded-full border-2 border-gold-500 bg-white px-4 py-2.5 text-base text-brown-900 placeholder:text-brown-900/40 focus:border-gold-600 focus:outline-none md:text-sm"
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              aria-label={t.send}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-gold-400),var(--color-gold-500))] text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PaperPlaneIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-brown-900/50">{t.disclaimer}</p>
        </form>
      </div>
    </DialogOverlay>
  );
}
