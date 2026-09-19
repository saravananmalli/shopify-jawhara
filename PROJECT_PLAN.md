# Jawhara — 14-Day Plan & Status

_Last reviewed: 2026-09-19. Code status: `tsc`, `eslint` and `next build` all pass. Behaviour was checked with scripted headless-Chrome runs against `localhost` and the live Shopify store (filters, tiles, sticky bar, drawer, before/after snapshots of every collection page). **Not done:** manual QA on real devices, Lighthouse, deployment. Shopify-side numbers below were read from the live Storefront API on the review date._

## Verdict

**The storefront is well ahead of the Day 1–7 plan, and the collection experience is now the most complete part. The blockers to "Week 1 done" are unchanged in kind: nothing is committed or deployed, there is no store locator, and a few UI pieces still show placeholder data.**

- Architecture follows the rules in `CLAUDE.md` (UI → services → adapters → normalized types, GraphQL isolated, tokens in one place).
- Homepage, header/mega-menus, cart, wishlist, product pages and a full collection/catalog page exist and build cleanly.
- **Nothing is committed:** last commit is `f426de8` on `fix/testimonials-and-production-files`, with ~38 modified/untracked files on top. One machine failure loses them.
- The remaining work is now mostly **Shopify Admin content** (collections, tags, menu links, products — the store has only 7 products) plus **a handful of code items** listed under "Pending".
- Days 8–14 (custom admin) have not started and still need a decision (see "Open decisions").

## Plan deviations (deliberate, keep them)

| Plan says | Actual | Verdict |
|---|---|---|
| Next.js 14 | Next.js **16.3.5**, React 19.2, Turbopack | Fine — newer. `AGENTS.md` warns APIs differ; read `node_modules/next/dist/docs/` before touching framework APIs. |
| Tailwind + gold `#8B7355` | Tailwind v4, tokens in `globals.css`. Primary gold is `#967123`; `#8B7355` is kept as `brown-800` | Fine — values come from the brand's real SCSS tokens. Confirm with the client that `#967123` should be primary. |
| Shopify Storefront API | Direct GraphQL client + `@shopify/hydrogen-react` | Fine. |
| Filters via Shopify | Shopify's collection `filters` argument ignores tags and has no multi-range price/on-sale filter, so those run in our own server-side scan | Deliberate. See "Known limitations". |

Legend: ✅ done · 🟡 partial · ❌ not started

## Status by day

### Day 1–2 — Setup & design system

| Item | Status | Notes |
|---|---|---|
| Next.js project structure | ✅ | `app/ components/ services/ graphql/ store/ hooks/ types/ utils/ config/` |
| Tailwind + custom colors | ✅ | Gold, cream, brown, maroon, state colors, motion tokens, `max-w-8xl` container in `globals.css` |
| Shopify Storefront API | ✅ | `services/shopify/{client,product-service,cart-service,content-service,catalog-service,adapters}.ts`; env via `config/shopify.ts` |
| Header, Footer, ProductCard | ✅ | Plus mega-menus, search overlay, location modal, cart drawer. Shared `Chip` / `ChipButton` added |
| Deploy empty shell to Vercel | ❌ | No Vercel config yet |

### Day 3–4 — Homepage sections

| Item | Status | Notes |
|---|---|---|
| Hero / carousel | ✅ | `Hero.tsx`, fed by `getHeroBanners()` |
| Shop by category | ✅ | `CategoryStrip.tsx`. Uses a **hardcoded handle list** in `app/page.tsx` (kept on request) |
| Features bar | ✅ | `FeaturesBar.tsx` |
| Product grid | ✅ | `ProductGridSection.tsx` with tabs |
| Story sections | ✅ | `HeritageSection`, `HorlogerieSection`, `ShopByOccasionSection` |
| Testimonials carousel | 🟡 | Reads `testimonial` metaobjects from Shopify (hidden when none). Still a grid, not a carousel. Not re-checked this review. Needs the `testimonial` definition + entries in Shopify Admin |
| Footer with links | 🟡 | Built. Has `FALLBACK_COLUMNS` and a hardcoded socials list — confirm links come from Shopify menus |

### Day 5–6 — Shopify integration

| Item | Status | Notes |
|---|---|---|
| Fetch products | ✅ | `getProducts`, collections, occasions, catalog pages |
| Product grids | ✅ | Home + the full collection page (below) |
| Add to cart | ✅ | `cartCreate / LinesAdd / LinesUpdate / LinesRemove`, all mutations request `userErrors`; `store/cart.tsx` + `CartDrawer` |
| Product details | ✅ | `/products/[handle]` with gallery, info, related / recently viewed, JSON-LD, `generateMetadata`. Badge now comes from tags |
| Store locator (map view) | ❌ | Only a `LocationModal` (UAE emirate picker). No `/stores` page, no map |

### Day 7 — Test & deploy

| Item | Status | Notes |
|---|---|---|
| Typecheck / lint / build | ✅ | All pass |
| Real browser testing | 🟡 | Scripted headless-Chrome checks for collection pages, filters, drawer (focus, Escape), sticky bar, mobile overflow. **Cart flow, real devices, screen readers still need a manual pass** |
| Responsive check | 🟡 | No horizontal overflow at 390px on collection pages. Mobile height of the sticky filter bar not reviewed |
| Performance | 🟡 | Homepage is ISR (1h). Not measured with Lighthouse. Collection pages are dynamic and run extra scans (see limitations) |
| Deploy to Vercel | ❌ | Not done |

### Day 8–14 — Custom admin (not started)

Nothing exists for `/admin`, auth, stores CRUD, delivery zones/charges, ratings moderation or analytics. No backend or database yet.

## Completed beyond the original plan — collections & catalog

Built after the Day 1–7 items; all in the working tree, **uncommitted**.

| Area | What exists |
|---|---|
| **Collection page** (`/collections/[handle]` and `/collections`) | One shared `CollectionPageView`. Category tile row, quick chips (All / New Arrival / Bestseller / Trending), count, filter dropdowns, "Show All Filters", Clear all, Sort By, product grid (shared `ProductCard`), Load more. `/collections` is the "all products" view |
| **Sticky behaviour** | Site header is static on `/collections…`; the filter bar is pinned instead. Header is still sticky everywhere else |
| **State in the URL** | Filters and sort live in `?filter=…&sort=…`: server-rendered, shareable. Filtered URLs are `noindex` with a canonical to the base page; input is validated before reaching Shopify. Title, description, OG/Twitter, `CollectionPage` JSON-LD |
| **Filters panel** | Accordion drawer + toolbar dropdowns, 13px, checkbox rows with counts. Sections: **Metal, Stone, Stone color, Shape, Brand** (from product tags), **Price** (5 bands, multi-select), **Deals** (on sale). Any filter Shopify's Search & Discovery returns also appears automatically. Availability filter removed by request |
| **Tag-driven sections** | Prefixed tags (`metal:18K White Gold`, `stone:Diamond`, `brand:Filo`) or plain tags from the vocabulary in `config/catalog.ts` (`18K Yellow Gold`, `Pearl`, `Diamonds`…) |
| **Category tiles — menu-driven** | Tiles = the other links in the same Shopify main-menu column as the current collection (also flat menus like "Our Collections"). Fallback: the `collections` menu |
| **Category tiles — Curations** | On CURATIONS & STYLE pages the top row stays the curations; a **Category** filter section lists the categories that have products in it |
| **Category tiles — Gold / Diamonds / Pearls** | Each nav's collections show as a set on their own pages (shared handle lists in `config/catalog.ts`, same lists as the header menus) |
| **Category tiles — Gift promo** | `/collections/gift` (the "Shop the collection" card): tiles filter the page in place, only categories with gift products |
| **Product badges** | "Dubai Bestseller" etc. now come from Shopify tags (`badge:<Label>` or known tags like `New Arrival`, `Trending`, `Limited Edition`, `Gift Pick`, `Exclusive`, `Bestseller`); no tag → no badge. Shared by the card and product page (`utils/product-badge.ts`) |
| **Server-side filtering** | Tag, price-band, on-sale and in-collection filters run in `catalog-service.ts` (light scan of id/tags/prices/collections, then only the page's products loaded) |
| **Safety checks used for each tile change** | Before/after snapshots of every collection page (72 pages) proved only the intended pages changed |

## Shopify Admin content status (read live, 2026-09-19)

The store exposes **7 products** to the Storefront API. "Empty" = collection exists and is linked but has 0 products.

| Nav section | Menu links | Linked to a collection | Linked but empty | Notes |
|---|---|---|---|---|
| Jewellery | 15 | 14 | 6 | Shop By Type + Gem & Metal (yellow/rose/white gold) + Curations linked. Only Trending Collections has products among the curations |
| Gifts | 16 | 16 | 14 | Linked, but several point to duplicated collections (`birthday-copy`, `gifts-under-aed-1-000-copy`…) — clean up the URL handles. Only a few products tagged |
| Our Collections | 16 | **3** | 0 | 13 items still need a collection + image + link |
| Bridal & Solitaires | 17 | 17 | 13 | Linked; needs products tagged (`bridal`, `stone:…`, `occasion:…`, `solitaire`, `bridal-set`, `wedding-band`, `bridal-party`) |
| Gold / Diamonds / Pearls | — | — | — | Not menu-driven: header uses handle lists in `config/catalog.ts`. Collections exist with images, mostly 0 products. `gold-bars-coins` does not exist yet |
| New & Exclusive | 0 | — | — | No children; not built out |

## Pending — code

Highest value first.

1. **Commit and push** the working tree on a feature branch (see Gaps).
2. **Remove placeholder data from `ProductCard`** (violates the "no fake data" rule): five stars and "(6)" are hardcoded, and the "1-3 Day Delivery" pill is fixed text. Options: read `reviews.rating` / `reviews.rating_count` metafields and the store delivery policy, and hide what has no data. This affects the homepage and every collection page.
3. **Store locator** (`/stores` list + map) — needs the data-source decision below.
4. **Testimonials carousel** and confirm Shopify `testimonial` entries exist.
5. **Footer** — replace `FALLBACK_COLUMNS` / hardcoded socials with Shopify menu data.
6. **Homepage "Shop By Category"** still uses a hardcoded handle list (`app/page.tsx`). Left as-is on request; can be made menu-driven like the collection page.
7. **Collection page polish:** the `all` page has no "New In" / "Best Selling" sort (Shopify has no `all` collection in the API; create one with handle `all` to enable them); product-rating and Collection facets are not built; the pinned filter bar is tall on phones; keyboard/screen-reader pass on the filters drawer.
8. **Diamonds / Pearls / Gold nav** could become menu-driven instead of code handle lists (one source for header + tiles).
9. **Add `generateStaticParams`** / caching review for collection and product routes once content stabilises.

## Pending — Shopify Admin setup

1. **Our Collections:** create/link the 13 missing collections (Ada, Alpha, Alwan, Carre, Colori, Colour Classic, Danah Diamond, Disney Collection, Dunyati, Farfalla Diamond, Solitaire, Tennis, Valentine collection), each with an image, published to the same sales channels.
2. **Tag products** (bulk **More actions → Add tags**): `metal:…`, `stone:…`, `bridal`, `occasion:…`, `recipient:…`, `solitaire`, `gift`, `brand:…`, `badge:…` as needed — the empty collections above stay empty until then.
3. **Curations:** Everyday Luxury, Filo, Statement Masterpieces, Online Exclusives Only have 0 products.
4. **Clean up duplicated gift collections:** rename URL handles (drop `-copy`), re-link if needed. Fix the By Price menu title `5000 - 1000` → `5000 - 10000` if not already done.
5. **Create the missing collections** `gold-bars-coins` (if wanted) and, optionally, `all`.
6. **Search & Discovery (optional):** configure native filters (Metal, Stone, Product rating, Collection) if you prefer Shopify-native facets over tags; the UI shows whatever Shopify returns.
7. **Product data:** the store has 7 products vs the ~800 in the design; the product type field is empty on all of them.
8. **Homepage tabs** still rely on tags `solitaire`, `ready-for-hand-delivery`, `trending`.

## Known limitations & risks

- **1,000-product scan cap.** Tag/price-band/on-sale/category filters and Metal/Stone/Category counts read up to 1,000 products per collection (up to 4 light requests, cached ~5 min for counts). Fine for now; a catalog well beyond that (the reference shows 801, so close) should move to Search & Discovery facets or a different approach.
- **Filter counts are static per collection** — they don't update as other filters are ticked, and can lag ~5 min.
- **Tag vocabulary lives in config** for plain tags (`TAG_FILTER_GROUPS`); anything else needs the prefixed form.
- **Missing collection URLs** return HTTP 200 with `noindex` (streaming behaviour of `loading.tsx`).
- **Dynamic routes.** `/collections` and `/collections/[handle]` are dynamic (they read search params).
- **Testing so far is scripted**, not human QA; cart flow and Lighthouse have not been run.

## Open decisions (need an answer before Day 8)

1. **Where do stores, delivery zones/charges and ratings live?** Options:
   - **A. Shopify-native (recommended to evaluate first):** stores → Shopify Locations or metaobjects; delivery → Shopify shipping profiles / Markets; reviews → a Shopify reviews app (this also supplies the rating metafields `ProductCard` needs). No custom backend, far less to build and secure.
   - **B. Custom backend on Railway** (as planned): full control, but you own auth, DB, and keeping data in sync with Shopify.
2. **Admin auth:** the plan says "authentication system" without a provider. Suggest NextAuth/Auth.js or a managed provider rather than hand-rolled.
3. **Backend stack for Railway:** not specified (Node/Express + Postgres is the usual choice). Pick before Day 8.
4. **Is the custom admin needed at all** if Option A covers stores/delivery/ratings? Worth deciding first; it could remove Days 8–14 or shrink them.
5. **Should the homepage strip and the Gold/Diamonds/Pearls nav be menu-driven** like the rest, so merchants edit them in Shopify instead of code?

## Suggested next steps (in order)

1. **Commit and push** current work on a feature branch (highest priority — nothing since `f426de8` is saved).
2. **Deploy to Vercel** with the three `NEXT_PUBLIC_SHOPIFY_*` env vars; confirm `.env.local` stays git-ignored.
3. **Replace the ProductCard placeholders** (stars/"(6)"/delivery pill) with real or hidden data.
4. **Finish Shopify content:** Our Collections (13 items), tags on products, curations, gift collection handles.
5. **Build `/stores`** after deciding the data source.
6. **Full manual QA + Lighthouse** on the deployed URL (cart flow, mobile, keyboard/focus).
7. **Decide A vs B** above, then start the admin.

## Original 14-day plan (reference)

```
DAY 1-2: Project Setup & Design System
├─ Create Next.js 14 project structure
├─ Setup Tailwind CSS with custom colors (gold #8B7355, browns)
├─ Setup Shopify Storefront API integration
├─ Create reusable components (Header, Footer, ProductCard)
└─ Deploy empty shell to Vercel

DAY 3-4: Homepage Sections (Static)
├─ Hero/Carousel section
├─ Shop By Category section
├─ Features bar
├─ Product grid layout
├─ Story sections
├─ Testimonials carousel
└─ Footer with links

DAY 5-6: Shopify Integration
├─ Fetch products from your 5 created items
├─ Display in product grids
├─ Add to cart functionality
├─ Fetch product details
└─ Store locator basic (map view)

DAY 7: Testing & Deploy
├─ Test all features
├─ Responsive design check (mobile)
├─ Performance optimization
└─ Deploy to Vercel (LIVE)

DAY 8-9: Custom Admin Setup
├─ Create admin dashboard at /admin
├─ Authentication system
├─ Dashboard layout
└─ Sidebar navigation

DAY 10-11: Admin Features
├─ Stores management (CRUD)
├─ Delivery zones configuration
├─ Delivery charges by city
├─ Ratings moderation panel
└─ Analytics dashboard

DAY 12-14: Polish & Deploy
├─ Beautiful admin UI (Tailwind)
├─ Test all features
├─ Deploy to Railway (backend)
├─ Final optimization
└─ Go LIVE!

✅ END OF WEEK 2: Production ready admin!
```
