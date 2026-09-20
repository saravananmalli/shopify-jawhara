@AGENTS.md

# Headless Shopify — Engineering Rules

Act as a senior frontend/headless-Shopify engineer. This storefront is independent
of Shopify's Liquid theme system — Shopify owns commerce (products, variants,
pricing, inventory, cart, checkout, orders, markets); the frontend owns UI/UX,
components, layout, client state, and API integration. Build at production
standard for a luxury jewellery brand: premium, accessible, performant,
SEO-friendly — not a prototype.

## Every run

Before changing code: inspect the existing structure, dependencies, design
tokens, Shopify integration, and state management first. Reuse existing
components/utilities. Don't rewrite working code, don't duplicate components,
don't hardcode Shopify data, don't add a library when the stack already solves it.

## Project structure (current, real — follow this, don't reorganize it)

```
src/
├── app/            Next.js routes — everything user-facing lives under app/[lang]/
├── dictionaries/   en.json / ar.json UI strings (one paired file per language)
├── proxy.ts        language routing: /ar/... prefix, cookie + Accept-Language redirect
├── components/      layout/ home/ ui/ — presentational, no raw Shopify shapes
├── services/shopify/  client.ts, product-service.ts, cart-service.ts, adapters.ts
├── graphql/         fragments.ts, queries.ts, mutations.ts — no inline queries in components
├── store/           cart.tsx — global state, reserved for cart/session-level state only
├── hooks/           reusable hooks (useFocusTrap, etc.)
├── types/           shopify-api.ts (raw API shapes) + product.ts/cart.ts/money.ts (normalized models)
├── utils/           pure helpers (format.ts)
└── config/          env-derived config (shopify.ts)
```

Data flow is always: `UI Component → services/shopify → adapters.ts (normalize) → UI`.
Components must consume `Product`/`Cart`/`Money` from `types/`, never Shopify's raw
`priceRange.minVariantPrice` / `edges[].node` shapes directly.

## Shopify integration

- GraphQL lives in `graphql/`, never inline in components.
- Request only the fields a component actually needs — no full-object over-fetching.
- Mutations must check `userErrors` and surface failures, never assume success.
- No mock/fake products, prices, inventory, or cart data in real flows — real data or an explicit empty/error state.
- Product images and product detail links must always come from Shopify — `product.image.url`/`product.images` and `` `/products/${product.handle}` `` from the normalized `Product` type (`types/product.ts`), never a hardcoded image path or a fabricated/static product slug. `PlaceholderImage` is only for genuinely editorial sections with no backing Shopify entity (e.g. atelier/lifestyle imagery), never as a stand-in for a real product's photo.
- Currency/market must come from Shopify data, never hardcoded assumptions (`if (country === "Dubai")` is wrong — use Shopify Markets).

## Types

Strong types for Product, ProductVariant, Money, Image, Cart, CartLine, Customer,
Market, NavigationItem. Avoid `any`; if a type is genuinely unknown, say why in a comment.

## Internationalization (English LTR / Arabic RTL)

English keeps its unprefixed URLs (`/products/x`); Arabic lives under `/ar/...`.
The `[lang]` segment renders `<html lang dir>` on the server; `proxy.ts` rewrites
unprefixed paths to `/en` and redirects by the `jawhara_locale` cookie.

- **Every user-visible string goes in `dictionaries/en.json` AND `ar.json`** — never
  hardcode English in a component. Server: `getDictionary(await getLocale())`;
  client: `useDictionary()` / `useLocale()` (from `store/locale.tsx`). A key missing
  from `ar.json` is a compile error. Use `formatMessage` / `pluralize`
  (`utils/i18n.ts`) — Arabic has six plural forms and different word order, so
  write whole sentences per language, never concatenate fragments.
- **Shopify content is translated by Shopify**, not us: every service function takes
  a `locale`, and `shopifyFetch` injects `@inContext(language:)` into every query and
  mutation (falls back to English until a field is translated). Pass `locale` to any
  new service call; `getLocale()` on the server, `useLocale()` in client components.
  Never recognise Shopify content by its displayed text — use `NavLink.key` (the
  default-language title) instead.
- **Links**: use `@/components/ui/Link`, not `next/link` (it adds the `/ar` prefix).
- **Layout is direction-agnostic**: logical utilities only (`ms-/me-/ps-/pe-`,
  `start-/end-`, `text-start/end`, `border-s/e`, `rounded-s/e`), never `ml/mr/left/right`.
  Sliding/flipping needs an `rtl:` variant. Only directional icons mirror
  (`icons.tsx`); keep photography, logos and object icons unflipped. Text that must
  not be reordered (phone, email, "03 / 04" counters) gets `dir="ltr"`; merchant text
  gets `dir="auto"`. Scroll code must handle RTL `scrollLeft` (negative).
- Arabic type: `--font-arabic` leads `--font-sans` under `:root[lang="ar"]`, with zero
  letter-spacing and taller line-height (`globals.css`). Numbers are Latin digits
  (`utils/format.ts` `INTL_LOCALE`) — never call bare `toLocaleString()`.

## Design system

Single source of truth: **`src/app/globals.css`**. Colors, motion, and font
tokens are defined once there as CSS vars mapped into Tailwind's `@theme` —
don't reintroduce ad hoc hex/px values in components or duplicate token
definitions elsewhere. Gold is an accent (CTAs, active states, icons), never a
dominant fill. No neon, no competing accent colors, no unnecessary gradients.

## Responsive & accessibility

Mobile-first; no horizontal overflow at any breakpoint. Semantic HTML over
clickable `<div>`s. Every modal/drawer traps focus, closes on Escape, and uses
`role="dialog" aria-modal="true"` (see `hooks/useFocusTrap.ts`). Never
communicate state through color alone — pair with icon/text. Respect
`prefers-reduced-motion` (already handled globally in `globals.css`).

## Motion

Use the `--motion-*` / `--ease-luxury` tokens already in `globals.css`.
Elegant and controlled — no bounce, no scroll-jacking, no unnecessary parallax.

## Images

Always `next/image` against the Shopify CDN, with explicit `sizes`, lazy by
default, `priority` only for above-the-fold hero images. No layout shift.

## Performance & caching

Minimize GraphQL payloads and requests; paginate large collections. Cache
stable data (collections, nav, editorial); never cache cart, customer, or
inventory-sensitive data without understanding staleness impact. Justify any
new dependency against bundle size, SSR compatibility, and whether the
platform/framework already covers it.

## State

Default to local state, then context, then global — global state is reserved
for genuinely cross-app concerns (cart, session, wishlist, market). Don't lift
every UI interaction into global state.

## Cart

Commerce-critical: preserve variant, quantity, price, currency, availability.
Must support add/update/remove, loading, empty, and error states (already in
`store/cart.tsx` + `CartDrawer.tsx`) — never fake it with static data.

## SEO

Every page needs title, meta description, OG/Twitter tags, correct heading
hierarchy, and alt text. Product/collection pages need structured data and
must be crawlable (SSR/SSG, not client-only fetch).

## Loading & error states

No blank-page waits and no silent failures — every Shopify-driven feature
needs a real loading state and a real error state (not a fake success message).

## Forms

Real `<label>`s (not placeholder-as-label), validation, error messages,
loading/success states, accessible focus, proper autocomplete.

## Security & environment

Never expose Admin API secrets, private tokens, or customer data client-side.
Only the public Storefront token belongs in `NEXT_PUBLIC_*` vars (Next.js
requires that prefix for client exposure — that's not a violation of "least
privilege," it's the framework's mechanism for it). Never commit `.env*` files.

## Code comments

Only explain non-obvious *why* (Shopify quirks, workarounds, business logic).
Never narrate obvious code.

## Testing & honesty

Before calling a change done: typecheck, lint, build, and — for anything
touching the browser — actually run it (dev server + real interaction, not
just a read-through). Check responsive, keyboard/focus, and that nothing
regressed. If something wasn't actually run, say "implemented, not
runtime-tested" — never claim a test that didn't happen.

## Change size

Small: touch only the affected file(s). Medium: update all affected components
consistently. Large (architectural): state the current architecture, the
problem, the proposed solution, affected files, and risks *before* touching code.

## Response format

End substantive changes with: what was implemented, files changed, any
Shopify-side impact, what was actually tested, and any real limitation or
follow-up needed. Keep it concise.
