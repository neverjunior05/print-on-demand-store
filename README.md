# THREADFORM

> **Good ideas. Great things to wear.**
>
> Design it in minutes, wear it in days, no inventory needed.

THREADFORM is an editorial print-on-demand storefront and browser-based design studio. People can discover independent creator work, personalize a product, place a mock or Stripe Test-mode order, and follow it through a simulated print partner—without maintaining inventory or requiring a paid fulfillment account.

![THREADFORM storefront screenshot placeholder](docs/screenshots/threadform-home.png)

*Screenshot placeholder — replace with a capture of the running storefront.*

![THREADFORM studio demo GIF placeholder](docs/screenshots/threadform-studio-demo.gif)

*Demo GIF placeholder — record a product customization, PNG export, and checkout flow.*

## What works

- **Eight browseable collections and 24 products** with search, category, color, size, price, tag, and sort filters.
- **Product pages** with color/size selection, alternate mockup views, size guide, reviews, wishlist, quick add, and Product JSON-LD.
- **Fabric.js design studio** with editable type, font/size/ink controls, clip-art shapes, PNG/JPG/SVG upload (10 MB limit; SVG script/external-reference sanitization), layers, delete, undo/redo, arrow-key nudging, print boundary, live product preview, PNG export, and saved designs.
- **Persistent cart and wishlist**, quick add, quantity changes, a cart drawer, promo entry, free-shipping progress, shipping validation, and order confirmation.
- **Email/password accounts** with scrypt password hashing and signed, `httpOnly`, `SameSite=Lax` sessions. Optional Google OAuth is available when configured.
- **Customer dashboard** for orders/status, saved designs, wishlist, local address book, and creator earnings inspiration.
- **Creator storefronts** with independent shop pages.
- **Admin area** for catalog overview, order desk, mock-fulfillment status advancement, promo code management, and analytics snapshots. Admin APIs require an admin session.
- **Mock fulfillment adapter** works locally without Printful/Printify credentials. Optional Stripe Checkout uses only server-side secrets and Stripe Test mode.
- Responsive mobile tab navigation, skip link, visible keyboard focus, semantic landmarks, reduced-motion support, dark/light theme toggle, sitemap, robots rules, Open Graph, and page metadata.

## Technology

- Next.js App Router, React, TypeScript
- PostgreSQL with Drizzle ORM and Drizzle Kit
- Fabric.js 7 for the browser canvas; Zod for API validation
- CSS design tokens and responsive component styles; localStorage-backed cart, theme, wishlist, addresses, and anonymous design backup
- Route Handlers for auth, catalog, designs, orders, checkout, webhook, SSE order updates, promotions, and fulfillment

This repository was supplied with a PostgreSQL + Drizzle runtime, so that is the database implementation here. The SQLite/Prisma option in the product brief is **not** wired into this app; do not run Prisma commands against this project. `drizzle-kit push` applies the schema directly to the configured PostgreSQL database.

## Design system

**Editorial neo-brutalism:** warm paper, thick ink outlines, hard offset shadows, sticker cards, print-shop labels, halftone/paper-grain texture, and oversized editorial type.

| Token | Light | Dark |
| --- | --- | --- |
| Primary / vermilion | `#FF4D2E` | `#FF6A4D` |
| Secondary / indigo | `#1B1B3A` | `#8E8CFF` |
| Accent / sunny yellow | `#FFD23F` | `#FFD23F` |
| Background | `#FFF8EC` | `#101018` |
| Surface | `#FFFFFF` | `#1A1A26` |
| Text | `#14131A` | `#F6F1E7` |

Fonts: **Bricolage Grotesque** (headlines), **DM Sans** (body), **JetBrains Mono** (labels/prices). Fonts load from Google Fonts with system fallbacks. Focus outlines use the high-contrast yellow accent. Reduced-motion preference disables the marquee and limits animation/transitions.

## Project structure

```text
.
├── README.md
├── .env.example
├── docker-compose.yml
├── drizzle.config.ts
├── public/
│   ├── favicon.svg
│   ├── images/threadform-hero.png
│   ├── manifest.json
│   └── textures/{halftone.svg,paper-grain.svg}
└── src/
    ├── app/
    │   ├── (auth)/{login,register}/page.tsx
    │   ├── admin/{analytics,orders,products,promos}/page.tsx
    │   ├── api/{admin,auth,checkout,designs,fulfillment,orders,products,webhooks}/...
    │   ├── cart/page.tsx
    │   ├── checkout/{page.tsx,success/page.tsx}
    │   ├── creator/[handle]/page.tsx
    │   ├── dashboard/{addresses,designs,earnings,orders,wishlist}/page.tsx
    │   ├── product/[slug]/page.tsx
    │   ├── shop/{page.tsx,[category]/page.tsx}
    │   ├── studio/page.tsx
    │   ├── globals.css, layout.tsx, sitemap.ts, robots.ts
    │   └── page.tsx
    ├── components/       # shared storefront, studio, account, and admin UI
    ├── config/           # site and grouped media URLs/fallbacks
    ├── db/                # Drizzle connection, schema, idempotent seed
    ├── lib/               # catalog, validation, session, money, fulfillment
    └── store/             # browser-persisted cart/theme/wishlist context
```

## Requirements

- Node.js 20.9+ (Next.js 16)
- npm
- PostgreSQL 15+ locally, or a PostgreSQL connection from Neon/Supabase
- Optional: a Stripe account in **Test mode** and Google OAuth credentials

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file and choose a session secret:

   ```bash
   cp .env.example .env
   ```

   `docker-compose.yml` provides a local PostgreSQL 16 service if you do not already have one:

   ```bash
   docker compose up -d db
   ```

3. Set `DATABASE_URL` in `.env`. The Drizzle Kit config reads `DATABASE_URL` from `.env` (the Compose/local URL is `postgresql://postgres:postgres@127.0.0.1:5432/app_db`).

4. Create/update PostgreSQL tables, then load the demo catalog:

   ```bash
   npx drizzle-kit push
   npx tsx src/db/seed.ts
   ```

   The seed is safe to rerun: product slugs, SKUs, creators, promo codes, the demo address, sample designs/reviews, and sample order are inserted without duplicating their seeded collections.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

- **Customer:** `demo@threadform.shop` / `threadform123`
- **Admin:** `admin@threadform.shop` / `threadform123`

Use the admin account to visit `/admin` and advance the mock order state machine. Change these passwords and `SESSION_SECRET` before deploying any shared environment.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL URL used by the Drizzle client |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin and absolute auth/payment redirects |
| `SESSION_SECRET` | Yes for production | HMAC key for signed session cookies; set a long random value |
| `STRIPE_SECRET_KEY` | No | `sk_test_...` key enables hosted Stripe Test-mode Checkout; blank means mock checkout |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (`whsec_...`) for paid-session confirmation |
| `NEXT_PUBLIC_STRIPE_ENABLED` | No | UI hint that Stripe is configured; never contains a secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret (server only) |
| `GOOGLE_REDIRECT_URI` | No | OAuth callback; local default is `http://localhost:3000/api/auth/google/callback` |
| `AI_HELPERS_ENABLED` | No | Reserved feature flag for future AI helpers |
| `LLM_API_KEY` | No | Reserved server-only key for a future AI helper |

Do not commit `.env`. For production use a database TLS URL and a unique random `SESSION_SECRET`.

## API overview

All mutation payloads are validated with Zod. Checkout accepts product slugs/variants and recomputes all prices from the server catalog; never trust a client price.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | PostgreSQL health check |
| `GET` | `/api/products?q=&category=` | Catalog lookup with local catalog fallback |
| `POST` | `/api/auth/register` | Create account, scrypt password hash, set session |
| `POST` | `/api/auth/login` | Verify credentials, set signed session |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Current session user |
| `GET`, `POST` | `/api/designs` | List saved/public designs; validate and save PNG design data |
| `GET` | `/api/designs/[id]` | Read a public or owner design |
| `POST` | `/api/checkout` | Validate shipping/cart/promo, recompute totals, create mock order or Stripe session |
| `GET` | `/api/orders` | Current user’s orders and line items |
| `GET` | `/api/orders/[id]/stream` | Server-Sent Events order status stream (authenticated owner) |
| `POST` | `/api/fulfillment/mock` | Admin-only next-step mock fulfillment update |
| `POST` | `/api/webhooks/stripe` | Verify Stripe signature and mark completed Checkout sessions received |
| `GET` | `/api/admin/orders` | Admin order desk data |
| `GET`, `POST`, `DELETE` | `/api/admin/promos` | Admin promo code management |

Auth/checkout use a small in-process rate guard suitable for a single-process demo. Replace it with a shared Redis/Upstash limiter before running multiple production instances.

## Mock fulfillment and real provider swaps

`src/lib/fulfillment.ts` is the provider boundary. `createMockFulfillment(orderNumber)` creates a mock provider reference and tracking number without a paid account. The admin action advances the explicit state machine:

```text
received → printing → shipped → delivered
```

The admin order desk calls `POST /api/fulfillment/mock`. Customer order pages subscribe to `/api/orders/[id]/stream` with SSE. To use Printful, Printify, or another vendor, implement the same adapter contract in `src/lib/fulfillment.ts`, call the provider after payment is confirmed, persist its external order/tracking reference, and map provider webhooks into the four THREADFORM statuses. Keep provider credentials server-side and preserve an idempotency key based on `orderNumber`.

## Stripe Test-mode checkout

Leave `STRIPE_SECRET_KEY` blank for the free mock payment flow. To test Stripe, set a **test** secret key (`sk_test_...`) in `.env`; configure the webhook URL as `/api/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET`. Checkout Sessions are created server-side from the validated catalog price, and the browser is redirected to Stripe-hosted checkout. No card data reaches THREADFORM.

Use Stripe's standard successful test card:

- Card: `4242 4242 4242 4242`
- Expiration: any future month/year
- CVC: any three digits
- Postal code: any valid test value

Stripe success URLs include an order number and order ID. The webhook verifies `Stripe-Signature` before marking a paid order `received`. Test keys only; never enable live keys without provider, tax, refund, and webhook hardening.

## Deployment

### Vercel + Neon or Supabase (recommended free-tier path)

1. Create a PostgreSQL database on Neon or Supabase and copy its pooled/runtime URL into `DATABASE_URL` (TLS-enabled production URL).
2. Deploy this repository to Vercel. Set `DATABASE_URL`, a long random `SESSION_SECRET`, and `NEXT_PUBLIC_SITE_URL` in project environment settings.
3. Apply schema from a trusted CI/local environment with `npx drizzle-kit push` (or introduce versioned SQL migrations before a production team workflow).
4. Seed only preview/demo environments. Do not seed demo credentials into a real customer database.
5. Add Google OAuth callback `https://your-domain/api/auth/google/callback` if Google sign-in is wanted. Add Stripe Test keys and webhook only when testing hosted checkout.
6. Rebuild and check `/api/health`, product detail SEO, and the checkout success/cancel paths.

Supabase Storage or Cloudinary can replace local/browser data for uploaded artwork when a production storage policy is needed; enforce image-only content, 10 MB upload limit, ownership checks, and signed URLs.

### Render or Netlify alternatives

- **Render:** use a PostgreSQL instance plus a Node web service running `npm run build` then `npm run start`; configure the same environment variables and run Drizzle schema setup as a release/deploy step.
- **Netlify:** use the Next.js adapter/plugin, configure a managed Postgres URL and server environment variables, then apply Drizzle schema before serving API functions. Verify Node 20+ and streaming support if using the SSE route.

For multi-instance deployments, replace the in-memory rate limiter, configure a shared session secret, and verify the host supports streaming and request-body limits appropriate for design uploads.

## Media credits and licenses

- Product/category lifestyle photography URLs are from **Unsplash** and used under the Unsplash License. Sources and fallback groups live in `src/config/media.ts`.
- Creator portrait photos use Unsplash; avatar fallbacks use **DiceBear Notionists** (`api.dicebear.com`) with its open-source avatar service.
- Development image fallback is **Picsum Photos**.
- The hero campaign image is an original image generated for this THREADFORM project.
- Google Fonts: Bricolage Grotesque, DM Sans, and JetBrains Mono are served via Google Fonts under their respective open font licenses.
- The editor’s simple clip-art is original SVG geometry built in the app. The paper grain and halftone texture SVGs are original project assets.

The current site uses browser `<img>` URLs with solid/background color fallbacks; replace third-party image URLs with locally optimized WebP/AVIF assets or a configured image CDN for a production content pipeline.

## Future improvements

- Move anonymous designs/uploads to owned object storage; add file scanning, larger print-resolution presets, and print-provider mockup templates per variant.
- Add real creator publishing/markup settlement, refunds, shipping-rate/tax calculation, address persistence API, and verified-review flows.
- Add durable shared rate limiting, email verification/password reset, Auth.js session provider, and production observability.
- Add provider-specific Printful/Printify webhooks, order idempotency/reconciliation, and integration tests.
- Add automated Playwright/Vitest suites and a multi-process SSE deployment test.
- Add an installable service worker/offline shell and optional opt-in motion/audio/AI helpers.

## License

MIT. See [`LICENSE`](LICENSE).
