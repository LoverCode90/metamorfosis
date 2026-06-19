# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run typecheck    # tsc --noEmit (run before every commit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check
```

The Husky pre-commit hook runs `lint-staged` then `npm run typecheck`. Zero TypeScript errors and zero ESLint warnings are required before merge.

There are no automated tests yet (Phase 10). Type-check is the primary correctness gate.

## Architecture

**Next.js 16 App Router** with route groups:

- `app/(marketing)/` — public pages, no auth required
- `app/(shop)/` — catalog, cart, checkout, wishlist, confirmation
- `app/(account)/` — profile, orders, tracking, verification (all auth-gated by middleware)
- `app/(admin)/admin/` — admin-only, role-checked server-side
- `app/api/` — route handlers (webhooks, cart, checkout, auth)
- `app/checkout/` — standalone checkout wizard (outside the shop group)

**Auth & middleware** (`middleware.ts`): Uses `@supabase/ssr` `createServerClient` with `getUser()` (never `getSession()`). Protected routes: `/profile`, `/checkout`, `/cart/verify`, `/admin`. Auth routes (`/login`, `/signup`) redirect logged-in users to `/profile`.

**Supabase clients** — three separate files, do not mix:

- `lib/supabase/client.ts` — browser client (components)
- `lib/supabase/server.ts` — server client (route handlers, server components)
- `lib/supabase/admin.ts` — service-role client, `import "server-only"`, used only in API routes that need to bypass RLS

**Catalog data flow**: Square → `lib/square/sync.ts` → Supabase tables (`product_translations`, `product_variations`) → `lib/catalog/queries.ts` (server-only reads) → `lib/catalog/mappers.ts` → typed `CatalogCard` / `CatalogProduct` → components.

**Price invariant**: All prices stored and passed as **integer cents** throughout the system. `CartItem.unitPrice`, `CatalogCard.minPriceCents`, `CatalogVariation.priceCents`, `Totals.*` fields are all in cents. `formatUSD(cents)` in `lib/utils/format.ts` divides by 100 before formatting — always pass cents to it.

**Cart state**: `stores/cart.ts` (Zustand + localStorage persist). Guest cart lives in localStorage. On login, `hooks/use-cart.ts` fires one `POST /api/cart/sync` — the module-level `_syncedUsers` set prevents duplicate syncs. `mergeGuestCart` in `lib/cart/db.ts` uses `Math.max(existing, guest)` quantity — not additive.

**Checkout anti-tamper**: `POST /api/checkout/validate-payment` ignores any price fields from the client. It fetches prices from Supabase (Square-synced), computes the total server-side via `lib/checkout/totals.ts`, then charges via `lib/square/payments.ts`. Never reuse client-sent amounts.

**Payment mode**: `NEXT_PUBLIC_PAYMENT_MODE=test` in `.env.local` skips the actual Square charge and returns a fake payment ID. The Square catalog always uses Production credentials (`SQUARE_ENVIRONMENT=production`) — the real inventory is in the production Square account, not sandbox.

**Image handling**: Product images live on Square's CDN. Use `squareImageUrl(url, width)` from `lib/utils/square-image.ts` to append `?width=N` for resizing. Use plain `<img>` tags (not `next/image`) for all product images. Fallback chain: `variation.image_url → product.image_url → "/placeholder.svg"`.

**i18n**: `messages/en.json` and `messages/es.json` for static UI strings. Dynamic product content uses bilingual DB columns (`name_en`, `name_es`, `description_en`, `description_es`). DeepL translation runs automatically in the Square sync for changed product text.

## Key conventions

**Money**: Variables named `*Cents` or `*_cents` are integers in cents. `Totals` fields (subtotal, discount, shipping, tax, total) are also in cents. `PRO_DISCOUNT_PER_ITEM = 200` (cents). `SHIPPING_TABLE` values in `lib/utils/totals.ts` are cents.

**Server-only modules**: Any file importing `import "server-only"` must never be imported from a Client Component. The Supabase admin client, Square sync, catalog queries, and cart DB module all carry this constraint.

**Square catalog custom attributes**: Read via `lib/square/attributes.ts` helpers (`getBoolAttr`, `getStringAttr`, etc.). Mapped to DB columns during sync: `is_professional`, `is_returnable`, `package_class`, `is_color_product`, `color_family`, `hex_color`, `shade_number`, `weight_lb`, `color_chart_pdf_url`.

**Professional discount**: $2.00 (200 cents) off per color product (`is_color_product = true`) for roles `professional` and `student` with `verification_status = 'approved'`. Computed server-side in `lib/checkout/discount.ts`; client-side version in `lib/utils/totals.ts:applyProDiscountClient` is display-only.

**No `any` types**. Use `unknown` and narrow. All Zod schemas live in `lib/validation/schemas.ts`.

**File naming**: `kebab-case.tsx` for files, `PascalCase` for components, `camelCase` for functions, `SCREAMING_SNAKE` for constants.

## Environment variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SQUARE_ACCESS_TOKEN           # Production token (sq0atp-...)
SQUARE_LOCATION_ID
SQUARE_WEBHOOK_SIGNATURE_KEY
NEXT_PUBLIC_SQUARE_APP_ID     # Production (sq0idp-...)
NEXT_PUBLIC_PAYMENT_MODE=test # Remove when taking live payments
SHIPPO_API_KEY
DEEPL_API_KEY
RESEND_API_KEY
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS=7000
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=4
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```
