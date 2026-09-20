"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMoney } from "@/utils/format";
import { formatMessage } from "@/utils/i18n";
import { SearchIcon, CloseIcon } from "@/components/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { getProducts, searchProducts } from "@/services/shopify";
import { getShopifyImageUrl } from "@/utils/shopify-image";
import type { Product } from "@/types/product";

// 2x the fixed 44x44 thumbnail.
const SEARCH_RESULT_IMAGE_WIDTH = 96;

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 6;

/**
 * Storefront API only exposes BEST_SELLING / CREATED_AT / PRICE / TITLE sort
 * keys — there's no distinct "trending" or "related" concept in Shopify, so
 * those tabs fall back to the closest real sort rather than faking a feed.
 */
const BROWSE_TABS = [
  { key: "related", sortKey: "BEST_SELLING" },
  { key: "latest", sortKey: "CREATED_AT" },
  { key: "bestseller", sortKey: "BEST_SELLING" },
  { key: "trending", sortKey: "BEST_SELLING" },
  { key: "new", sortKey: "CREATED_AT" },
] as const;

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const locale = useLocale();
  const { search: t, common } = useDictionary();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof BROWSE_TABS)[number]["key"]>(
    BROWSE_TABS[0].key
  );
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const [wasOpen, setWasOpen] = useState(open);

  useFocusTrap(panelRef, open, onClose);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setActiveTab(BROWSE_TABS[0].key);
      setResults([]);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH) return;

    const id = ++requestId.current;
    const isSearch = trimmed.length >= MIN_QUERY_LENGTH;

    const timer = setTimeout(
      async () => {
        setIsLoading(true);
        setError(null);
        try {
          const products = isSearch
            ? await searchProducts({ query: trimmed, first: RESULTS_LIMIT, locale })
            : await getProducts({
                first: RESULTS_LIMIT,
                sortKey: BROWSE_TABS.find((t) => t.key === activeTab)!.sortKey,
                locale,
              });
          if (id === requestId.current) setResults(products);
        } catch {
          if (id === requestId.current) {
            setError(t.error);
          }
        } finally {
          if (id === requestId.current) setIsLoading(false);
        }
      },
      isSearch ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => clearTimeout(timer);
  }, [open, query, activeTab, locale, t.error]);

  const isSearching = query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxury ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.label}
        className={`absolute inset-x-0 top-0 max-h-[85vh] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-luxury ${
          open ? "translate-y-0" : "-translate-y-4"
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-gold-300 bg-white px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-gold-700" />
              <input
                type="search"
                autoFocus
                maxLength={100}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                aria-label={t.inputLabel}
                className="w-full text-sm outline-none placeholder:text-brown-900/40"
              />
            </div>
            <button
              onClick={onClose}
              aria-label={t.close}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brown-900/60 hover:bg-cream-100"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row">
            {!isSearching && (
              <div className="shrink-0 sm:w-44">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brown-900/50">
                  {t.trending}
                </p>
                <ul className="flex gap-2 overflow-x-auto sm:flex-col sm:gap-1 sm:overflow-visible">
                  {BROWSE_TABS.map((tab) => (
                    <li key={tab.key}>
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        aria-pressed={activeTab === tab.key}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-start text-sm transition-colors sm:w-full sm:rounded-lg ${
                          activeTab === tab.key
                            ? "bg-gold-50 font-semibold text-gold-700"
                            : "text-brown-900/70 hover:bg-cream-100"
                        }`}
                      >
                        {t.tabs[tab.key]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="min-w-0 flex-1">
              {error && (
                <p role="alert" className="py-6 text-center text-sm text-error-700">
                  {error}
                </p>
              )}

              {!error && isLoading && (
                <p className="py-6 text-center text-sm text-brown-900/50">
                  {t.searching}
                </p>
              )}

              {!error && !isLoading && isSearching && results.length === 0 && (
                <p className="py-6 text-center text-sm text-brown-900/50">
                  {formatMessage(t.noResults, { query: query.trim() })}
                </p>
              )}

              {!error && !isLoading && results.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-cream-100"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-100">
                          {product.image ? (
                            <Image
                              src={getShopifyImageUrl(product.image.url, SEARCH_RESULT_IMAGE_WIDTH)}
                              alt={product.image.altText}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span dir="auto" className="block truncate text-sm text-brown-900">
                            {product.title}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-brown-900/50">
                            <span className="font-medium text-gold-700">
                              {formatMoney(product.price.amount, product.price.currencyCode, locale)}
                            </span>
                            <span aria-hidden>·</span>
                            <span>
                              {product.available ? common.inStock : common.outOfStock}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
