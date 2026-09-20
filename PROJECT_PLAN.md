# Jawhara — 14-Day Plan & Status

_Last reviewed: 2026-09-20. Code status: `tsc`, `eslint` and `next build` pass. Everything is committed and pushed (branch `feat/arabic-rtl`, PRs #1–#18 merged into `main`). Behaviour was checked with scripted headless-Chrome runs against `localhost` and the live Shopify Storefront API. **Not done:** testing on real devices, Lighthouse, a confirmed production deployment. Shopify counts on 2026-09-20: 7 products, 71 collections, 12 `store_location` entries, 0 `testimonial` entries._

## Verdict

**The web storefront (plan Days 1–7) is built and well beyond scope: Arabic/RTL, a full collection/catalog experience, store locator, reviews, wishlist, Shopify-driven pages and a phone-first UI. What is left is deployment and QA, Shopify Admin content, and a few small code items. The custom admin (Days 8–14) has not been started and, given how the store now works, may not be needed.**

- Architecture follows `CLAUDE.md` (UI → services → adapters → normalized types, GraphQL isolated, tokens in `globals.css`, all strings in `dictionaries/en.json` + `ar.json`).
- The repository is no longer at risk: the earlier "nothing is committed" blocker is resolved.
- Remaining work is mostly **Shopify Admin content** (products, collections, tags, page/policy text) and **deploy + real-device QA**.

## Plan deviations (deliberate, keep them)

| Plan says | Actual | Verdict |
|---|---|---|
| Next.js 14 | Next.js **16.3.5**, React 19.2, Turbopack | Fine — newer. `AGENTS.md` warns APIs differ; read `node_modules/next/dist/docs/` before touching framework APIs. |
| Tailwind + gold `#8B7355` | Tailwind v4, tokens in `globals.css`. Primary gold is `#967123`; `#8B7355` is kept as `brown-800` | Fine — values come from the brand's real SCSS tokens. Confirm with the client that `#967123` should be primary. |
| Shopify Storefront API | Direct GraphQL client + `@shopify/hydrogen-react` | Fine. |
| Filters via Shopify | Shopify's collection `filters` argument ignores tags and has no multi-range price/on-sale filter, so those run in our own server-side scan | Deliberate. See "Known limitations". |
| Custom backend for stores / delivery / ratings | Stores = Shopify metaobjects; reviews = Judge.me; delivery = rules in `config/delivery.ts` | In effect the "Shopify-native" option was taken (see Open decisions). |
| Account / login | Shopify-hosted customer accounts (`/account` on the store domain) | Supported route for headless; no password handling in our code. |

Legend: ✅ done · 🟡 partial · ❌ not started

## Status by day

### Day 1–2 — Setup & design system

| Item | Status | Notes |
|---|---|---|
| Next.js project structure | ✅ | `app/ components/ services/ graphql/ store/ hooks/ types/ utils/ config/` |
| Tailwind + custom colors | ✅ | Gold, cream, brown, maroon, state colors, motion tokens; one `page-container` utility and fluid `--page-gutter` |
| Shopify Storefront API | ✅ | `services/shopify/{client,product-service,cart-service,content-service,catalog-service,review-service,adapters}.ts`; env via `config/shopify.ts` |
| Header, Footer, ProductCard | ✅ | Plus mega-menus, search overlay, location modal, cart drawer, phone bottom bar |
| Deploy empty shell to Vercel | 🟡 | No `vercel.json` in the repo. `main` is merged regularly, so a Vercel project may exist — confirm the URL and its env vars |

### Day 3–4 — Homepage sections

| Item | Status | Notes |
|---|---|---|
| Hero / carousel | ✅ | `getHeroBanners()`, swipe on phones. **Shopify content issue:** the current banner's `hasBakedInText` flag is off although the photo already contains "only Natural Diamonds", so the text prints twice; also needs a mobile image field on the `hero_banner` metaobject |
| Shop by category | ✅ | `CategoryStrip.tsx`, handle list in `config/catalog.ts` (`SHOP_BY_CATEGORY_HANDLES`), shared with the phone category sheet |
| Features bar | ✅ | `FeaturesBar.tsx` |
| Product grid | ✅ | `ProductGridSection.tsx` with swipeable tabs |
| Story sections | ✅ | `HeritageSection`, `AtelierSection`, `ShopByOccasionSection` |
| Customer reviews | ✅ | `CustomerReviews` from Judge.me (needs `JUDGEME_PRIVATE_API_TOKEN` + `JUDGEME_SHOP_DOMAIN` on the host; hidden when there are none) |
| Testimonials | 🟡 | Reads `testimonial` metaobjects (0 exist, so the section is hidden). Still a grid, not a carousel |
| Footer with links | 🟡 | Real links to pages/policies (en/ar) from `dictionaries`; used until the Shopify `footer` menu has column-style items. **The seven social icons are still placeholders linking to `#`** |

### Day 5–6 — Shopify integration

| Item | Status | Notes |
|---|---|---|
| Fetch products | ✅ | `getProducts`, collections, occasions, catalog pages |
| Product grids | ✅ | 2/3/4 columns, shared with skeletons via `config/layout.ts` |
| Add to cart | ✅ | `cartCreate / LinesAdd / LinesUpdate / LinesRemove`, `userErrors` checked; `store/cart.tsx` + `CartDrawer` |
| Product details | ✅ | Gallery (swipe on phones), info, related / recently viewed, JSON-LD, metadata |
| Store locator | 🟡 | `/stores`: list, filters, "Show nearby stores", Directions links; 12 stores from `store_location` metaobjects. **No embedded map** (the plan asked for a map view) |
| Delivery estimates | ✅ | By emirate with geolocation prompt (`config/delivery.ts`, display only — checkout doesn't enforce it) |

### Day 7 — Test & deploy

| Item | Status | Notes |
|---|---|---|
| Typecheck / lint / build | ✅ | All pass |
| Responsive check | ✅ | Scripted overflow audit: 7 routes × 20 viewports (320–2560, portrait + landscape) × EN/AR = 0 horizontal overflow. Not run on real devices |
| Real browser testing | 🟡 | Scripted headless Chrome (touch emulation, both languages). **Real iPhone/Android, cart→checkout, screen readers still need a manual pass** |
| Performance | 🟡 | Homepage is ISR; images use `next/image`. Not measured with Lighthouse |
| Deploy to Vercel | ❌ | Not confirmed (see Day 1–2) |

### Day 8–14 — Custom admin (not started)

Nothing exists for `/admin`, auth, stores CRUD, delivery zones/charges, ratings moderation or analytics. Stores, reviews and delivery are already covered without a backend (see deviations), so the need for this block should be re-decided first.

## Completed beyond the original plan

| Area | What exists |
|---|---|
| **Arabic / RTL** | English unprefixed, Arabic under `/ar`; `proxy.ts` routing + cookie; Shopify content translated by Shopify; logical CSS only; Arabic type stack; all UI strings paired in `en.json` / `ar.json`. Shopify Arabic content is not published yet |
| **Collection & catalog** | `/collections` and `/collections/[handle]`: category tiles (menu-driven; the selected tile scrolls to the start), quick chips, filter dropdowns + drawer, custom sort dropdown, tag-driven badges, URL-driven filter state, server-side filtering, JSON-LD |
| **Phone experience** | Bottom tab bar (Home / Categories / Account / Cart) with a real-Shopify category sheet, delivery + language row under the header, header and bar that hide on scroll down and return on scroll up, swipeable chip rows, compact product cards, sticky filter bar |
| **Responsive system** | Fluid container/gutter, fluid typography sizes, 44px touch targets on dialogs, inert closed dialogs, ref-counted scroll lock, skeletons that match real breakpoints |
| **Reviews** | Judge.me reviews on product pages and home; ratings from `reviews.rating` metafields on cards |
| **Wishlist** | Heart on cards/product; `/wishlist` page re-fetches products live from Shopify (ids stored in the browser only) |
| **Shopify-driven pages** | `/pages/[handle]` and `/policies/[handle]` render Admin pages and policies (sanitised HTML, SEO metadata, 404 when missing). Content pack from jawharajewellery.com in `docs/shopify-content/` |
| **Account** | Log In / Account link to Shopify's hosted customer account |

## Shopify Admin content status

(Menu/collection tables read live 2026-09-19; product/collection/store/testimonial counts re-read 2026-09-20.) "Empty" = collection exists and is linked but has 0 products.

| Nav section | Menu links | Linked to a collection | Linked but empty | Notes |
|---|---|---|---|---|
| Jewellery | 15 | 14 | 6 | Shop By Type + Gem & Metal linked. Only Trending Collections has products among the curations |
| Gifts | 16 | 16 | 14 | Several point to duplicated collections (`birthday-copy`, `gifts-under-aed-1-000-copy`…) — clean up handles |
| Our Collections | 16 | **3** | 0 | 13 items still need a collection + image + link |
| Bridal & Solitaires | 17 | 17 | 13 | Needs products tagged (`bridal`, `stone:…`, `occasion:…`, `solitaire`, `bridal-set`, `wedding-band`, `bridal-party`) |
| Gold / Diamonds / Pearls | — | — | — | Not menu-driven: handle lists in `config/catalog.ts`. Mostly 0 products. `gold-bars-coins` does not exist |
| New & Exclusive | 0 | — | — | No children; not built out |

## Pending — code

Highest value first.

1. **Confirm deployment:** find/create the Vercel project for this repo; set `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`, `NEXT_PUBLIC_SHOPIFY_API_VERSION`, `JUDGEME_PRIVATE_API_TOKEN`, `JUDGEME_SHOP_DOMAIN` (and `NEXT_PUBLIC_SITE_URL` for the custom domain); confirm `.env.local` stays git-ignored. Missing Judge.me variables silently hide the reviews section — consider a server log line.
2. **Real-device QA** (iOS Safari, Android Chrome): scroll auto-hide, swipe, safe-area on the bottom bar, keyboard/focus, screen readers; then **Lighthouse** on the deployed URL.
3. **Account and orders:** Log In links to Shopify's hosted account (requires customer accounts enabled). Decide whether that is enough or whether an in-storefront account area is wanted (needs Customer Account API app setup).
4. **Footer socials:** replace the placeholder letter icons and `#` links with real URLs (ideally from a Shopify menu or metaobject).
5. **Store locator map:** add an embedded map (list + map) if still wanted.
6. **Testimonials:** carousel instead of grid; create `testimonial` entries.
7. **Blog / Journal:** the live site has a Journal and `/blogs/news`; no blog routes exist yet.
8. **Sitemap:** add Shopify pages/policies to `sitemap.ts`.
9. **Collection page polish:** the `all` collection lacks "New In" / "Best Selling" sorts (create a Shopify collection with handle `all`); rating and Collection facets not built; keyboard/screen-reader pass on the filters drawer.
10. **Menu-driven nav:** Gold / Diamonds / Pearls nav and the homepage category strip still use code handle lists.
11. **Caching review** (`generateStaticParams` for collection/product routes) once content stabilises.
12. **Footer contact block:** emails in `Footer.tsx` use `jawharajewllery.ae` (misspelled); the live site uses `jawharajewellery.ae`. Confirm and fix.

## Pending — Shopify Admin setup

1. **Paste the content pack** (`docs/shopify-content/README.md`): six pages (About, FAQ, Contact, Careers, User Responsibilities, Limitation of Liability) and four policies (Privacy, Shipping, Terms, Refund); then translate to Arabic with Translate & Adapt. Review the placeholders noted in that README first. The default Privacy Policy still reads "My Store 2 operates this store…".
2. **Hero banner:** set `hasBakedInText` correctly and, ideally, add a mobile image to the `hero_banner` metaobject.
3. **Our Collections:** create/link the 13 missing collections (Ada, Alpha, Alwan, Carre, Colori, Colour Classic, Danah Diamond, Disney Collection, Dunyati, Farfalla Diamond, Solitaire, Tennis, Valentine collection), each with an image, published to the same sales channels.
4. **Tag products** (bulk **More actions → Add tags**): `metal:…`, `stone:…`, `bridal`, `occasion:…`, `recipient:…`, `solitaire`, `gift`, `brand:…`, `badge:…`.
5. **Curations:** Everyday Luxury, Filo, Statement Masterpieces, Online Exclusives Only have 0 products.
6. **Clean up duplicated gift collections** (drop `-copy` handles). Fix the By Price menu title `5000 - 1000` → `5000 - 10000` if not already done.
7. **Optional:** collection `all` and `gold-bars-coins`; Search & Discovery facets (Metal, Stone, Product rating, Collection); customer accounts enabled; footer menu with column-style items.
8. **Product data:** 7 products vs ~800 in the design; product type is empty on all of them.
9. **Homepage tabs** still rely on tags `solitaire`, `ready-for-hand-delivery`, `trending`.
10. **Arabic:** publish Arabic in Shopify and translate content (products, collections, menus, pages).

## Known limitations & risks

- **1,000-product scan cap.** Tag/price-band/on-sale/category filters and counts read up to 1,000 products per collection. Fine now; a catalog near the reference's ~800 should move to Search & Discovery facets.
- **Filter counts are static per collection** — they don't update as other filters are ticked, and can lag ~5 min.
- **Tag vocabulary lives in config** for plain tags (`TAG_FILTER_GROUPS`).
- **Missing collection URLs** return HTTP 200 with `noindex` (streaming behaviour of `loading.tsx`).
- **Dynamic routes:** `/collections/**`, `/products/**`, `/pages/**` and `/policies/**` render on demand (Shopify data cached ~1 h).
- **Wishlist is per-browser** (localStorage); it cannot follow a customer across devices without an account integration.
- **Delivery labels are display-only** — checkout does not enforce them.
- **Scroll auto-hide** uses a sticky `top` offset (not a transform) so dialogs inside the header keep working; verified only in emulated touch.
- **Testing is scripted**, not human QA.

## Open decisions

1. **Custom admin (Days 8–14): still needed?** Stores (metaobjects), reviews (Judge.me) and delivery (config) work without a backend. If the merchant needs delivery zones/charges editable in a UI or ratings moderation beyond Judge.me, decide between Shopify metaobjects/Locations or a custom backend (Railway); otherwise drop Days 8–14.
2. **Account area:** Shopify-hosted login (current) vs an in-storefront account using the Customer Account API.
3. **Should the homepage strip and the Gold/Diamonds/Pearls nav be menu-driven** so merchants edit them in Shopify instead of code?
4. **Store locator:** is an embedded map required, or are the list and Directions links enough?
5. **Primary gold:** confirm `#967123` with the client.

## Suggested next steps (in order)

1. **Deploy / confirm deployment** and set all env vars, including Judge.me (fixes the reviews section missing on live).
2. **Paste the Shopify content pack** and publish Arabic translations so the footer pages stop returning 404.
3. **Real-device QA + Lighthouse** on the deployed URL.
4. **Finish Shopify content:** Our Collections (13), product tags, curations, gift collection handles, real products.
5. **Small code items:** footer socials, testimonials carousel, sitemap entries, store map (if wanted), footer email spelling.
6. **Decide** on the custom admin and the account area.

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
