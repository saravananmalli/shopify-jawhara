# Jawhara — 14-Day Plan & Status

_Last reviewed: 2026-09-19. Status is based on inspecting the repo and running `tsc`, `eslint` and `next build` (all pass). Nothing was runtime-tested in a browser for this review._

## Verdict

**Yes, the direction is good — the storefront is well ahead of the Day 1–7 plan, but the plan has three gaps to fix before calling Week 1 done.**

- Architecture follows the rules in `CLAUDE.md` (UI → services → adapters → normalized types, GraphQL isolated, tokens in one place).
- Homepage, header/mega-menus, cart, wishlist, collection and product pages already exist and build cleanly.
- Gaps: **nothing is committed or deployed**, **there is no store locator**, and **some homepage content is still hardcoded** (testimonials, footer socials).
- Days 8–14 (custom admin) have not started, and that part of the plan needs a decision (see "Open decisions").

## Plan deviations (deliberate, keep them)

| Plan says | Actual | Verdict |
|---|---|---|
| Next.js 14 | Next.js **16.3.5**, React 19.2, Turbopack | Fine — newer. `AGENTS.md` warns APIs differ; read `node_modules/next/dist/docs/` before touching framework APIs. |
| Tailwind + gold `#8B7355` | Tailwind v4, tokens in `globals.css`. Primary gold is `#967123`; `#8B7355` is kept as `brown-800` | Fine — values come from the brand's real SCSS tokens. Confirm with the client that `#967123` should be primary. |
| Shopify Storefront API | Direct GraphQL client + `@shopify/hydrogen-react` | Fine. |

## Status by day

Legend: ✅ done · 🟡 partial · ❌ not started

### Day 1–2 — Setup & design system

| Item | Status | Notes |
|---|---|---|
| Next.js project structure | ✅ | `app/ components/ services/ graphql/ store/ hooks/ types/ utils/ config/` |
| Tailwind + custom colors | ✅ | Gold, cream, brown, maroon, state colors, motion tokens, `max-w-8xl` container in `globals.css` |
| Shopify Storefront API | ✅ | `services/shopify/{client,product-service,cart-service,content-service,adapters}.ts`; env via `config/shopify.ts` |
| Header, Footer, ProductCard | ✅ | Plus mega-menus, search overlay, location modal, cart drawer |
| Deploy empty shell to Vercel | ❌ | No Vercel config, no commits since "Initial Next.js setup" |

### Day 3–4 — Homepage sections

| Item | Status | Notes |
|---|---|---|
| Hero / carousel | ✅ | `Hero.tsx`, fed by `getHeroBanners()` |
| Shop by category | ✅ | `CategoryStrip.tsx`, real collections by handle |
| Features bar | ✅ | `FeaturesBar.tsx` |
| Product grid | ✅ | `ProductGridSection.tsx` with tabs |
| Story sections | ✅ | `HeritageSection`, `HorlogerieSection`, `ShopByOccasionSection` |
| Testimonials carousel | 🟡 | Built, but **3 hardcoded reviews**, static grid (not a carousel), and a fixed "4.97 / 5.0" rating |
| Footer with links | 🟡 | Built. Has `FALLBACK_COLUMNS` and a hardcoded socials list — confirm links come from Shopify menus |

### Day 5–6 — Shopify integration

| Item | Status | Notes |
|---|---|---|
| Fetch products | ✅ | `getProducts`, collections, occasions |
| Product grids | ✅ | Home + `/collections/[handle]` |
| Add to cart | ✅ | `cartCreate / LinesAdd / LinesUpdate / LinesRemove`, all mutations request `userErrors`; `store/cart.tsx` + `CartDrawer` |
| Product details | ✅ | `/products/[handle]` with gallery, info, JSON-LD, `generateMetadata` |
| Store locator (map view) | ❌ | Only a `LocationModal` (UAE emirate picker). No `/stores` page, no map |

### Day 7 — Test & deploy

| Item | Status | Notes |
|---|---|---|
| Typecheck / lint / build | ✅ | All pass |
| Real browser testing | ❌ | Not done — cart flow, mobile, keyboard/focus still need a manual pass |
| Responsive check | ❌ | Not verified |
| Performance | 🟡 | Homepage is ISR (1h). Not measured with Lighthouse |
| Deploy to Vercel | ❌ | Not done |

### Day 8–14 — Custom admin (not started)

Nothing exists for `/admin`, auth, stores CRUD, delivery zones/charges, ratings moderation or analytics. No backend or database yet.

## Gaps to close before "Week 1 done"

1. **Commit and push.** Almost the whole app is untracked (`src/components`, `src/services`, `src/store`, etc.). One machine failure loses it. Highest priority.
2. **Deploy to Vercel** with the three `NEXT_PUBLIC_SHOPIFY_*` env vars. `.env.local` is git-ignored — confirm `.gitignore` covers it before pushing.
3. **Store locator.** Build `/stores` with a list plus map. Data source is the open decision below.
4. **Remove fake content.** Testimonials are hardcoded and reference a different brand ("Maison Vendôme"). Replace with real reviews or an explicit empty state. This also violates the "no mock data" rule in `CLAUDE.md`.
5. **Missing production essentials:** no `loading.tsx`, `error.tsx`, `not-found.tsx`, `sitemap.ts` or `robots.ts` anywhere. Collection and product routes are dynamic (`ƒ`) — consider `generateStaticParams` + revalidate for SEO and speed.
6. **Manual QA pass:** add to cart → update → remove → checkout redirect, mobile widths, keyboard/focus in drawers, Lighthouse.
7. **Shopify-side data:** homepage tabs rely on product tags (`solitaire`, `ready-for-hand-delivery`, `trending`). Until tagged in Shopify Admin they show "no products match".

## Open decisions (need an answer before Day 8)

1. **Where do stores, delivery zones/charges and ratings live?** Options:
   - **A. Shopify-native (recommended to evaluate first):** stores → Shopify Locations or metaobjects; delivery → Shopify shipping profiles / Markets; reviews → a Shopify reviews app. No custom backend, far less to build and secure.
   - **B. Custom backend on Railway** (as planned): full control, but you own auth, DB, and keeping data in sync with Shopify.
2. **Admin auth:** the plan says "authentication system" without a provider. Suggest NextAuth/Auth.js or a managed provider rather than hand-rolled.
3. **Backend stack for Railway:** not specified (Node/Express + Postgres is the usual choice). Pick before Day 8.
4. **Is the custom admin needed at all** if Option A covers stores/delivery/ratings? Worth deciding first; it could remove Days 8–14 or shrink them.

## Suggested next steps (in order)

1. Commit and push current work on a feature branch.
2. Deploy shell to Vercel; verify env vars.
3. Fix testimonials (real data or empty state) and add `loading/error/not-found/sitemap/robots`.
4. Build `/stores` (after deciding the data source).
5. Full manual QA + Lighthouse on the deployed URL.
6. Decide A vs B above, then start the admin.

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
