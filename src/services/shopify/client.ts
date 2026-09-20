import { cache } from "react";
import { createStorefrontClient } from "@shopify/hydrogen-react";
import { shopifyConfig } from "@/config/shopify";
import { localeConfig, type Locale } from "@/config/i18n";

const { getStorefrontApiUrl, getPublicTokenHeaders } = createStorefrontClient({
  storeDomain: `https://${shopifyConfig.storeDomain}`,
  publicStorefrontToken: shopifyConfig.storefrontToken,
  storefrontApiVersion: shopifyConfig.apiVersion,
});

export class ShopifyApiError extends Error {}

async function request(body: string, revalidate?: number): Promise<unknown> {
  const res = await fetch(getStorefrontApiUrl(), {
    method: "POST",
    headers: getPublicTokenHeaders(),
    body,
    ...(revalidate !== undefined && { next: { revalidate } }),
  });

  if (!res.ok) {
    throw new ShopifyApiError(
      `Shopify Storefront API request failed with status ${res.status}`
    );
  }

  const json = await res.json();

  if (json.errors) {
    throw new ShopifyApiError(
      json.errors.map((e: { message: string }) => e.message).join("\n")
    );
  }

  return json.data;
}

// Server: POST fetches aren't deduplicated by Next, so the same query asked
// for twice in one render (metadata + page, layout + page, two menu lookups)
// would hit Shopify twice. React's per-request cache collapses those.
const requestOncePerRender = cache(request);

// Browser: `next.revalidate` is server-only, so client callers (tab switches,
// search, recently viewed) get the same TTL from a small in-memory cache, plus
// in-flight sharing so two identical calls in the same tick make one request.
const BROWSER_CACHE_MAX_ENTRIES = 60;
const browserCache = new Map<string, { expiresAt: number; data: unknown }>();
const browserInflight = new Map<string, Promise<unknown>>();

function requestInBrowser(body: string, revalidate: number): Promise<unknown> {
  const hit = browserCache.get(body);
  if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.data);

  const pending = browserInflight.get(body);
  if (pending) return pending;

  const promise = request(body)
    .then((data) => {
      if (browserCache.size >= BROWSER_CACHE_MAX_ENTRIES) {
        const oldest = browserCache.keys().next().value;
        if (oldest !== undefined) browserCache.delete(oldest);
      }
      browserCache.set(body, { expiresAt: Date.now() + revalidate * 1000, data });
      return data;
    })
    .finally(() => browserInflight.delete(body));

  browserInflight.set(body, promise);
  return promise;
}

const OPERATION_HEADER = /^(\s*(?:query|mutation)\s+\w+)\s*(?:\(([^)]*)\))?\s*\{/m;

/** Makes every operation language-aware by construction: a query written
 * without `@inContext` would silently return English on the Arabic site.
 * Shopify falls back to the default language for untranslated fields, so this
 * is safe before Arabic content exists. The country is deliberately left to
 * Shopify Markets rather than assumed here. */
function withLanguageContext(query: string): string {
  return query.replace(
    OPERATION_HEADER,
    (_header, head: string, vars?: string) =>
      `${head}(${vars ? `${vars.trim().replace(/,$/, "")}, ` : ""}$language: LanguageCode) @inContext(language: $language) {`
  );
}

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate,
  locale,
}: {
  query: string;
  variables?: Record<string, unknown>;
  locale: Locale;
  /** Seconds to cache for, server (Next data cache) and browser (in-memory).
   * Omit for data that must always be live (cart) and for mutations. Product
   * data uses a short TTL: availability/price can lag by at most that long,
   * and the cart mutation re-validates stock in Shopify regardless. */
  revalidate?: number;
}): Promise<T> {
  const body = JSON.stringify({
    query: withLanguageContext(query),
    variables: { ...variables, language: localeConfig[locale].shopifyLanguage },
  });
  const isMutation = query.trimStart().startsWith("mutation");

  if (isMutation) return (await request(body)) as T;

  if (typeof window !== "undefined" && revalidate !== undefined) {
    return (await requestInBrowser(body, revalidate)) as T;
  }

  return (await requestOncePerRender(body, revalidate)) as T;
}
