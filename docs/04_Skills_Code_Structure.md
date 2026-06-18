# Metamorfosis LLC — Skills, Code Structure & Workflow

### Context Document for Cursor AI · v1.0

This document is the **first** thing Cursor reads before touching any code. It defines how to work, how to organize files, how to write code, and what NOT to do.

---

## 1. The Golden Rule — Plan Before Code

Before writing or modifying any code, Cursor produces a **written plan** with:

1. What it's about to do (file list, components affected, integration points)
2. Which branch it will work on
3. What it will NOT do in this step (scope boundary)
4. Estimated number of file changes

The plan goes to the user. The user pastes it into the Claude conversation for sign-off. **No code without an approved plan.** This prevents Cursor from going rogue and creating spaghetti.

### Planning template

```
## Plan: [Short title]

**Branch:** feat/[name] from develop

**Scope:**
- Will modify: [file 1, file 2, ...]
- Will create: [file 1, file 2, ...]
- Will NOT touch: [explicit exclusions]

**Steps:**
1. [Concrete action]
2. [Concrete action]
3. [Concrete action]

**Why this order:** [1-2 sentence rationale]

**Open questions for the user:** [list, or "none"]
```

---

## 2. Git Workflow — Always Branches, Never Direct to main

### 2.1 Initial repo setup (one-time)

When Cursor first connects the project to GitHub:

1. **Create branch `archive/v0-academy`** from the current state and push it. This preserves the v0-generated Academy page exactly as it is.
2. **Create `develop`** as the working branch.
3. **`main`** is production-only. Nothing merges to main without explicit user approval.
4. On `develop`, delete the Academy directory after the archive branch is safely pushed. We will rebuild Academy from scratch in v2 (Phase 2, not v1).

### 2.2 Day-to-day workflow

- Every feature → its own branch off `develop`: `feat/catalog-page`, `feat/cart-context`, `feat/checkout-flow`, etc.
- Every fix → `fix/[name]`
- Every refactor → `refactor/[name]`
- Commit frequently with **clear, present-tense messages**: `add Square sync engine`, `refactor cart context for server state`, `fix race condition in checkout validation`.
- Never force-push to shared branches.
- Never commit `.env` files. Verify `.gitignore` has `.env*` before any commit.

### 2.3 PR discipline

Before opening a PR (or merge to develop):

- TypeScript compiles with zero errors
- ESLint passes with zero warnings
- No `console.log` debug statements left behind
- No commented-out code
- No `any` types unless documented why

---

## 3. The Phased Build Plan

Cursor follows this order. Each phase must be approved before the next begins.

### Phase 0 — Archive & Reset

- Branch `archive/v0-academy` created and pushed
- `develop` branch created
- Academy directory removed on `develop`

### Phase 1 — Foundation (no business logic yet)

- Folder structure (section 5)
- Design tokens, Tailwind config, dark mode theme (section 4)
- Typography system
- Base UI primitives migrated/cleaned (button, dialog, input, etc.)
- `lib/` utilities: cn, formatUSD, date helpers
- TypeScript strict mode + path aliases (`@/components`, `@/lib`)
- ESLint + Prettier configured
- Husky pre-commit hook (typecheck + lint)

### Phase 2 — Refactor existing v0 code into the new structure

- Move components to their proper folders
- Rewrite components that don't follow the rules in section 6
- Replace `cart-context.tsx` (which holds everything) with separated contexts
- Remove unused dependencies from `package.json`
- All existing pages still work, just cleaner

### Phase 3 — Database + Auth integration

- Supabase client setup (`@/lib/supabase/client`, `@/lib/supabase/server`)
- Auth flows: Google, Apple, email/password
- Middleware for protected routes
- Profile creation trigger verified working
- Admin role assignment documented

### Phase 4 — Catalog (Square sync)

- Square API client wrapper
- Webhook receiver with signature validation
- Sync engine (ITEM + ITEM_VARIATION + custom attributes)
- Product translation layer (DeepL)
- Catalog page reading from Supabase
- Product detail with color swatches reading `hex_color`, `shade_number`, `color_family`

### Phase 5 — Cart + Checkout

- Cart state (Zustand persisted to localStorage for guests)
- Stock concurrency: live Square check before payment
- Server-side total calculation (anti-tamper)
- Square Web Payments SDK integration **using sandbox/test mode only**
- Verification gate for professional products

### Phase 6 — Shipping + Orders

- Shippo integration with packing algorithm
- Address book with Google Places autocomplete
- Order creation + Square order sync
- Tracking page with Leaflet map (authenticated users only)

### Phase 7 — Professional verification

- License upload to private bucket
- Gemini Vision processing
- Admin verification dashboard
- Three-state user flow (regular → pending → verified/rejected)

### Phase 8 — Cases + Returns

- 14-day return window
- Case creation with evidence upload
- Admin case management
- Auto-delete evidence on close

### Phase 9 — Translation layer (DEFERRED to last)

- next-intl integration
- Locale switcher
- All UI strings extracted to `messages/en.json` and `messages/es.json`
- DeepL for dynamic product content

### Phase 10 — Testing + Hardening

- Unit tests for pure functions (totals, packing, validation)
- Integration tests for critical flows (checkout, verification)
- Manual security audit against the Security Blueprint
- Pre-production checklist

### Phase 11 — Domain-dependent items (when user provides domain)

- Resend domain verification
- Cloudflare Turnstile production keys
- CORS production config
- Production env variables

---

## 4. Design System — Dark Premium Minimal

### 4.1 The aesthetic direction

**NOT** generic black-and-white. **NOT** terminal-black. **NOT** flat gray.

The target is: **rich dark background with deliberate accent colors**. Think premium fashion ecommerce, premium SaaS, modern design portfolios. Generous spacing, refined typography, subtle elevation, restrained use of color where it counts.

### 4.2 Color tokens

CSS variables in `app/globals.css`. Use `oklch()` for all colors (better perceptual uniformity than HSL).

```css
:root {
  /* Backgrounds — layered dark */
  --bg-base: oklch(
    0.16 0.005 280
  ); /* page background — near-black with subtle purple undertone */
  --bg-surface: oklch(0.2 0.005 280); /* cards, elevated panels */
  --bg-surface-2: oklch(0.24 0.005 280); /* hovered cards, popovers */
  --bg-inset: oklch(0.13 0.005 280); /* inputs, deeper panels */

  /* Foreground — refined whites */
  --fg-primary: oklch(0.97 0.005 280); /* primary text */
  --fg-secondary: oklch(0.72 0.01 280); /* secondary text */
  --fg-tertiary: oklch(0.52 0.01 280); /* placeholders, disabled */

  /* Borders & dividers */
  --border-subtle: oklch(0.28 0.005 280);
  --border-strong: oklch(0.36 0.005 280);

  /* Accent palette — drawn from premium design references */
  /* Use ONE accent dominant per page section. Never mix more than 2 accents in one viewport. */
  --accent-violet: oklch(0.68 0.18 290); /* primary brand accent */
  --accent-amber: oklch(0.78 0.15 75); /* warm highlights, recommendations */
  --accent-emerald: oklch(0.72 0.14 160); /* success, professional discount */
  --accent-rose: oklch(0.7 0.18 15); /* destructive, alerts */
  --accent-sand: oklch(0.82 0.06 80); /* warm neutrals, badges */

  /* Semantic */
  --success: var(--accent-emerald);
  --warning: var(--accent-amber);
  --danger: var(--accent-rose);
  --info: var(--accent-violet);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 22px;

  /* Shadows — soft, never harsh */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.35);
  --shadow-lg: 0 16px 40px -8px rgb(0 0 0 / 0.45);
  --shadow-glow:
    0 0 0 1px oklch(0.68 0.18 290 / 0.2),
    0 8px 30px -4px oklch(0.68 0.18 290 / 0.25);
}
```

**Critical rules for accent usage:**

- Default state of an accent is `border-subtle` or `fg-secondary` — accent reveals on hover, focus, selected, or to convey meaning (success/warning/danger).
- Never use 5 accents on the same screen. Pick ONE dominant accent for the page section, the rest stay neutral.
- Buttons: primary uses `bg-fg-primary text-bg-base` (high contrast white on dark), not an accent color. Accents are for state, not for the main CTA.
- Reserve `--accent-violet` for brand moments (logo area, hero, premium badges).

### 4.3 Typography

Install these via `next/font/google`:

- **Geist** — primary UI font (already in v0 build, keep it)
- **Instrument Serif** — display font for headlines, hero text, accents. Used sparingly for elegance.
- **JetBrains Mono** — already implied through `Geist Mono`, use for code blocks and tabular numbers if needed

Type scale (Tailwind):

- `text-xs` (12px) → metadata, badges
- `text-sm` (14px) → body
- `text-base` (16px) → primary body, default
- `text-lg` (18px) → emphasized body
- `text-xl` (20px) → section subheads
- `text-2xl` (24px) → section heads
- `text-3xl` (30px) → page heads
- `text-4xl` (36px) → hero supports
- `text-5xl` / `text-6xl` → hero only, with Instrument Serif

Always use `tracking-tight` on headings, `tracking-normal` on body, `tracking-wide` only on small caps eyebrows.

### 4.4 Spacing & layout

- Default container max-width: `max-w-6xl mx-auto px-4 sm:px-6`
- Wide layouts: `max-w-7xl` only when content demands it
- Vertical rhythm: section padding `py-16 sm:py-24` on landing, `py-8 sm:py-12` on app pages
- Card padding: `p-5 sm:p-6` standard, `p-6 sm:p-8` for hero cards
- Gap between cards in grids: `gap-4 sm:gap-6`

### 4.5 Components style guide

- **Borders**: 1px, `border-subtle` by default. `border-strong` on focus or hover.
- **Buttons**: Height `h-10` default, `h-11` for primary CTAs, `h-12` for hero CTAs. Radius `rounded-md` (10px).
- **Inputs**: Same heights as buttons. Always `bg-bg-inset` for input backgrounds (slightly darker than card), border `border-subtle`, focus `border-accent-violet`.
- **Cards**: `bg-bg-surface`, `border border-subtle`, `rounded-xl` (16px).
- **Modals/Dialogs**: `bg-bg-surface-2`, `rounded-xl`, `shadow-lg`, backdrop `bg-black/60 backdrop-blur-sm`.
- **Hover states**: Use `bg-bg-surface-2` for surfaces. Never use `opacity` for hover; opacity feels cheap.
- **Focus states**: Always visible. `ring-2 ring-accent-violet ring-offset-2 ring-offset-bg-base`.

---

## 5. Folder Structure

```
/
├── docs/                          # All context docs from Claude live here
│   ├── 00_Schema.sql
│   ├── 01_Business_Workflows.md
│   ├── 02_Technical_Integration_Specs.md
│   ├── 03_Security_Blueprint.md
│   └── 04_Skills_Code_Structure.md  (this file)
│
├── app/                           # Next.js App Router
│   ├── (marketing)/               # Public pages, no auth needed
│   │   ├── page.tsx               # Home
│   │   ├── products/
│   │   │   ├── page.tsx           # Catalog
│   │   │   └── [slug]/page.tsx    # Product detail
│   │   ├── about/page.tsx
│   │   └── kits/
│   │       └── page.tsx           # Static kits showcase (no checkout yet)
│   │
│   ├── (shop)/                    # Cart & checkout
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── confirmation/[orderId]/page.tsx
│   │
│   ├── (account)/                 # Authenticated routes
│   │   ├── profile/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── tracking/[orderId]/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── verify/page.tsx        # License verification flow
│   │
│   ├── (admin)/admin/             # Admin-only
│   │   ├── verifications/page.tsx
│   │   ├── cases/page.tsx
│   │   └── orders/page.tsx
│   │
│   ├── api/                       # Route handlers
│   │   ├── webhooks/
│   │   │   ├── square/route.ts
│   │   │   └── shippo/route.ts
│   │   ├── checkout/
│   │   │   ├── calculate/route.ts
│   │   │   └── submit/route.ts
│   │   ├── shipping/rates/route.ts
│   │   └── verification/submit/route.ts
│   │
│   ├── auth/                      # Auth callback routes
│   │   └── callback/route.ts
│   │
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/                        # Primitives (button, dialog, input, etc.)
│   ├── layout/                    # Header, footer, navigation
│   ├── catalog/                   # Product card, filters, gallery, swatches
│   ├── cart/                      # Cart items, summary, line item
│   ├── checkout/                  # Steps, payment, address book
│   ├── profile/                   # Profile cards, verification panel
│   ├── admin/                     # Admin dashboards (separate from public)
│   └── shared/                    # Reusable cross-cutting (empty states, loaders)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (cookies)
│   │   └── admin.ts               # Service-role client (server-only)
│   ├── square/
│   │   ├── client.ts
│   │   ├── sync.ts                # Catalog sync engine
│   │   └── webhook.ts             # Signature validation
│   ├── shippo/
│   │   ├── client.ts
│   │   ├── packing.ts             # Box assignment algorithm
│   │   └── boxes.ts               # Box templates (user-editable dimensions)
│   ├── email/
│   │   ├── provider.ts            # EmailProvider interface
│   │   ├── resend.ts              # Resend implementation
│   │   ├── ses.ts                 # AWS SES (commented stub)
│   │   └── templates/             # Per-email-type HTML templates
│   ├── auth/
│   │   ├── middleware.ts
│   │   └── helpers.ts             # requireAuth, requireAdmin
│   ├── validation/
│   │   ├── schemas.ts             # All Zod schemas
│   │   └── sanitize.ts            # HTML sanitization wrapper
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts              # formatUSD, formatDate
│   │   └── totals.ts              # Cart total calculation (pure)
│   ├── constants.ts               # Free shipping threshold, low-stock threshold, etc.
│   └── types.ts                   # Shared TypeScript types
│
├── stores/                        # Zustand stores
│   ├── cart-store.ts
│   ├── ui-store.ts                # Modals, drawers, toasts
│   └── wishlist-store.ts
│
├── hooks/
│   ├── use-cart.ts                # Reads from store + adds derived state
│   ├── use-user.ts                # Supabase user + profile
│   └── use-debounced-value.ts
│
├── messages/                      # i18n (Phase 9)
│   ├── en.json
│   └── es.json
│
├── public/
│   ├── color-charts/              # PDF files (blank placeholders for now)
│   └── kit-assets/
│
└── middleware.ts                  # Next.js middleware: auth, locale, rate limits
```

---

## 6. Code Quality Rules — No Spaghetti

### 6.1 File size limits

- Component file: **max 200 lines**. If bigger → split into subcomponents in the same folder.
- Hook file: **max 100 lines**.
- Utility file: **max 150 lines**.
- Route handler: **max 120 lines**. Move logic into `lib/` modules.

If Cursor exceeds these limits, it must split the file before continuing.

### 6.2 Component rules

**Each component file = ONE default export + tightly related sub-components.**

```tsx
// ✅ GOOD — focused, single responsibility
export function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <ProductCardImage src={product.image} alt={product.name} />
      <ProductCardMeta product={product} />
    </article>
  )
}

function ProductCardImage({ src, alt }: { src: string; alt: string }) { ... }
function ProductCardMeta({ product }: { product: Product }) { ... }
```

**Forbidden patterns:**

- One file with 5 unrelated components
- Component doing fetch + state + render + business logic all together
- Inline `useEffect` chains longer than 10 lines
- Prop drilling more than 2 levels — use Zustand or context instead

### 6.3 The "Where does logic live?" rule

| Type of logic                                           | Where it goes                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| Pure data transforms (calculate totals, format strings) | `lib/utils/`                                                   |
| API calls to external services (Square, Shippo)         | `lib/<service>/`                                               |
| Database queries                                        | `lib/supabase/` or in server actions                           |
| Form state                                              | `react-hook-form` + Zod schemas in `lib/validation/schemas.ts` |
| Global app state (cart, UI flags)                       | Zustand stores in `stores/`                                    |
| Server state (data from DB)                             | `@tanstack/react-query`                                        |
| Component-local state                                   | `useState`                                                     |

**Never** put a fetch inside a component. **Never** put price calculation inside JSX. **Never** put validation logic inline in event handlers.

### 6.4 TypeScript discipline

- `strict: true` in tsconfig
- Zero `any` types. Use `unknown` and narrow.
- All API responses typed via Zod schemas (infer the type from the schema)
- All component props use explicit interfaces, not inline types for anything > 2 props
- Treat JSX/TSX as plain JS/TS — the type system is your friend, not a ceremony

### 6.5 Naming

- Files: `kebab-case.tsx` — `product-card.tsx`, not `ProductCard.tsx`
- Components: `PascalCase` — `ProductCard`
- Functions and variables: `camelCase` — `calculateTotals`, `currentUser`
- Constants: `SCREAMING_SNAKE` — `FREE_SHIPPING_THRESHOLD_CENTS`
- Types and interfaces: `PascalCase` — `Product`, `CartItem`
- Booleans: `is`/`has`/`can` prefix — `isLoading`, `hasItems`, `canCheckout`
- Event handlers: `handle` prefix — `handleSubmit`, `handleAddToCart`
- Async functions that fetch: `fetch` / `get` / `create` / `update` / `delete` prefix
- Comments in English. Variable names in English. Spanish only for user-facing strings in `messages/es.json`.

### 6.6 No magic numbers, no magic strings

```ts
// ❌ BAD
if (cart.total >= 70) {
  shipping = 0
}

// ✅ GOOD
// lib/constants.ts
export const FREE_SHIPPING_THRESHOLD_CENTS = 7000

// in code
if (cart.totalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
  shipping = 0
}
```

### 6.7 Error handling

Every async function that can fail:

```ts
async function fetchProductFromSquare(id: string): Promise<Product> {
  try {
    const res = await squareClient.catalog.retrieveItem(id)
    if (!res.result.object) {
      throw new Error(`Product ${id} not found in Square`)
    }
    return mapSquareToProduct(res.result.object)
  } catch (error) {
    logger.error("Square product fetch failed", { id, error })
    throw new ProductSyncError(`Failed to fetch product ${id}`, {
      cause: error,
    })
  }
}
```

- Always log with context (what was happening, what input)
- Throw typed custom errors (`ProductSyncError`, `PaymentValidationError`)
- Never `console.log` errors silently and continue
- API routes always return JSON with `{ error: string }` on failure, never raw stack traces

---

## 7. Library Stack (install these in Phase 1)

```jsonc
"dependencies": {
  // Framework
  "next": "^16.x",           // v0 already generated with 16.2.6 — keep it
  "react": "^19",
  "react-dom": "^19",

  // Database & Auth
  "@supabase/ssr": "^0.5",
  "@supabase/supabase-js": "^2.45",

  // Server state
  "@tanstack/react-query": "^5",

  // Client state
  "zustand": "^5",

  // Forms & validation
  "react-hook-form": "^7",
  "@hookform/resolvers": "^3",
  "zod": "^3",

  // UI primitives (keep existing v0 stack)
  "@base-ui/react": "^1.5",
  "class-variance-authority": "^0.7",
  "clsx": "^2",
  "tailwind-merge": "^3",
  "tailwindcss": "^4",
  "tw-animate-css": "^1",

  // Icons
  "lucide-react": "latest",

  // Date
  "date-fns": "^4",

  // External APIs
  "square": "^41",
  "shippo": "^2",
  "resend": "^4",
  "deepl-node": "^1",
  "@google/generative-ai": "^0.21",

  // i18n (Phase 9)
  "next-intl": "^3",

  // Maps & places
  "@vis.gl/react-google-maps": "^1",
  "use-debounce": "^10",
  "leaflet": "^1.9",
  "react-leaflet": "^4",

  // File upload
  "react-dropzone": "^14",

  // HTML sanitization
  "isomorphic-dompurify": "^2",

  // Rate limiting
  "@upstash/ratelimit": "^2",
  "@upstash/redis": "^1",

  // Analytics
  "@vercel/analytics": "^1"
},

"devDependencies": {
  "@types/node": "^22",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/leaflet": "^1",
  "typescript": "^5.7",
  "eslint": "^9",
  "eslint-config-next": "^15",
  "prettier": "^3",
  "prettier-plugin-tailwindcss": "^0.6",
  "husky": "^9",
  "lint-staged": "^15"
}
```

Run `npm install` after Phase 1 starts. Do not install packages outside this list without first proposing it to the user.

---

## 8. Critical Behavioral Rules for Cursor

### 8.1 Never invent data

- Never invent SKUs, prices, weights, stock counts
- Never assume URLs, domains, or API endpoints — ask the user
- Never invent user data in seed scripts — use clearly fake placeholder data like `test@example.com`

### 8.2 Payment safety

**This is the most important rule in the entire document.**

When integrating Square Web Payments SDK:

- **USE SANDBOX ONLY** during development. Set `SQUARE_ENVIRONMENT=sandbox` in `.env`.
- Square provides test card numbers for sandbox: `4111 1111 1111 1111` (success), `4000 0000 0000 0002` (declined), etc. Documented at `https://developer.squareup.com/docs/devtools/sandbox/payments`.
- Never use a real card number for testing. Never use the user's personal card.
- The Square Application ID for sandbox starts with `sandbox-sq0idb-...` — verify this prefix in your `.env` before running any payment flow.
- Production Square credentials are added by the user at deployment time, not by Cursor during development.

### 8.3 Image fallback chain

For any product image displayed in the app:

```ts
function getProductImage(variation: Variation, parent: Product): string {
  if (variation.image_url) return variation.image_url
  if (parent.image_url) return parent.image_url
  return null // render <PlaceholderImage /> component, never a broken image icon
}
```

Never use placeholder services (Unsplash, Picsum). Build a local `<PlaceholderImage />` component with the brand mark on a `bg-bg-inset` background.

### 8.4 PDF placeholders

The user does not have the real color chart PDFs uploaded yet. For now:

- Create a `public/color-charts/` folder with 5 blank PDF files: `earthia-color.pdf`, `nutrapel-uhd-cp.pdf`, `rbl-gama.pdf`, `color-tech-gama.pdf`, `color-tech-zero.pdf`
- Each can be a minimal valid PDF with just a title page saying "[Color line] — Color Chart (placeholder)"
- The product detail page links to and downloads from these
- The user will replace each PDF with the real one later

### 8.5 Domain-dependent items — defer, don't block

The user has not purchased a domain yet. These items are blocked and Cursor must NOT try to configure them until the user provides the domain:

- Resend domain verification
- Cloudflare Turnstile production site/secret keys (sandbox keys work for dev)
- CORS production origin
- Production OAuth callback URLs
- Email FROM address

Use `.env.example` placeholders like `NEXT_PUBLIC_APP_URL=http://localhost:3000` and clearly comment "REPLACE FOR PRODUCTION" in the file.

### 8.6 Gemini Vision for license verification

The user asks: does Cursor need an example license document to build the verification flow?

**Answer: no.** The flow is fully describable without sample images. Cursor uses these prompts and confidence thresholds (already documented in `02_Technical_Integration_Specs.md`):

```ts
const LICENSE_EXTRACTION_PROMPT = `
You are reviewing a beauty industry license or professional contract document. Extract:
- License number (alphanumeric, may include dashes)
- Full name on the license
- Issue date (YYYY-MM-DD if visible)
- Expiration date (YYYY-MM-DD if visible)
- Issuing authority (state board, school name, business name)
- Document type: 'cosmetology_license' | 'barber_license' | 'esthetician_license' |
                 'student_contract' | 'salon_business_license' | 'unknown'

Return JSON only:
{
  "license_number": string | null,
  "full_name": string | null,
  "issue_date": string | null,
  "expiration_date": string | null,
  "issuing_authority": string | null,
  "document_type": string,
  "confidence": number (0 to 1),
  "is_expired": boolean,
  "flags": string[]  // any concerns: blurry, partial, suspicious
}
`
```

Confidence routing:

- `≥ 0.85` AND not expired AND has license number → auto-approve
- `0.50 – 0.85` OR missing fields → manual review queue
- `< 0.50` OR expired OR flagged → auto-reject with reason

For licenses, always expect: a number, a name, a date. For student contracts: a name, a school name, an enrollment date. The model is smart enough — no reference image needed.

### 8.7 Testing safety

When the user requests tests (Phase 10):

- Unit tests use fake data, never hit real APIs
- Integration tests against Square sandbox only
- Never run a test that creates real orders, charges real cards, or sends real emails to real users
- Test emails go to a `+test@` alias or are mocked

### 8.8 When in doubt — ask, don't guess

If a piece of context is missing (which color chart belongs to which line, what category a product is in, what the user prefers), **stop and ask the user**. A 30-second clarification beats a 3-hour wrong implementation.

---

## 9. Specific Adaptations from v0 Code

The user has a v0-generated codebase. Cursor's job is to evolve it, not throw it away. Specific adaptations:

### 9.1 Keep

- The overall visual feel (minimal, clean, refined)
- The component primitive choices (Base UI, lucide-react, CVA)
- The page structure and section layouts
- The card, button, and input visual style — just retoned for dark mode
- Border radii and spacing rhythm

### 9.2 Refactor

- `components/store/cart-context.tsx` is a god-object. Split into:
  - `stores/cart-store.ts` (Zustand) — cart items, totals, persistence
  - `stores/ui-store.ts` — modals, drawers
  - `hooks/use-user.ts` — Supabase user + profile
  - `lib/utils/totals.ts` — pure total calculation
- `lib/checkout.ts` mixes types, data, and helpers. Split into:
  - `lib/types.ts` — types only
  - `lib/utils/totals.ts` — pure helpers
  - `lib/utils/format.ts` — formatUSD, formatDate
  - The hardcoded `INITIAL_CART` and `RELATED_PRODUCTS` go away — real data from Supabase
- `lib/catalog.ts` is fully fake/seeded data — replace with real Square-synced catalog from Supabase
- View-based navigation (`setView('cart')`) is anti-pattern for Next.js — convert to actual routes with App Router

### 9.3 Archive (do not delete from git)

- `components/store/academy/academy-page.tsx` → archive branch, then remove from `develop`
- The placeholder pages — replaced by real pages

### 9.4 Replace

- Light-mode CSS variables → dark-mode tokens (section 4.2)
- Hardcoded English strings → i18n keys (in Phase 9)
- v0 metadata in `app/layout.tsx` → real Metamorfosis brand metadata

### 9.5 Remove

- `app/checkout/page.tsx` doing `redirect("/")` — useless
- Unused dependencies in `package.json`
- Demo states like the "Preview state" toggle in checkout (default/error/expired)

---

## 10. Square Environment — Production from Day One

The store's real inventory (Earthia, RBL, UHD CP, and the rest) is already uploaded to the **production** Square account. We do NOT use sandbox — there is nothing in sandbox and we are not rebuilding the inventory there.

**What this means:**

- `SQUARE_ENVIRONMENT=production` in `.env.local`
- App ID starts with `sq0idp-...` (not `sandbox-sq0idb-...`)
- All catalog reads hit the real catalog — that is intentional
- Use the production access token from Square Dashboard → Applications → Production credentials

**For payment testing during development:** Square production does not have magic test cards like sandbox. The safe approach during development is:

1. Keep the checkout form connected but set a flag `NEXT_PUBLIC_PAYMENT_MODE=test` in `.env.local`
2. When `PAYMENT_MODE=test`, the payment button shows "Test Mode — No charge will occur" and calls a mock payment handler instead of Square Payments SDK
3. The mock handler returns a fake `paymentId` and creates the order in Supabase as if payment succeeded
4. Remove the test flag only when the user explicitly says "we are ready to take live payments"

This lets us build and test the entire checkout flow end-to-end without charging anyone.

```ts
// lib/square/payments.ts
export async function processPayment(params: PaymentParams) {
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === 'test') {
    // Simulated success — dev/staging only
    return { ok: true, paymentId: `test-${Date.now()}`, amount: params.amountCents }
  }
  // Real Square payment
  const result = await squareClient.paymentsApi.createPayment({ ... })
  return mapSquarePayment(result)
}
```

Add to `.env.local`:

```
NEXT_PUBLIC_PAYMENT_MODE=test   # Remove this line when ready for live payments
```

---

## 11. Image Strategy — Square CDN, Zero Next.js Processing

### 11.1 Why this approach

Square's CDN supports **on-the-fly image resizing** via URL parameters. We delegate 100% of image resizing to Square's CDN. This means:

- Zero Next.js image optimization costs (no `next/image` processing pipeline for product images)
- Zero storage costs (images live on Square's CDN, not our storage)
- Dynamic quality per context — small for cards, large for detail

### 11.2 The utility function

```ts
// lib/utils/square-image.ts

/**
 * Injects or replaces the `width` param in a Square CDN image URL.
 * Square CDN format: https://items-images-production.s3.us-west-2.amazonaws.com/.../original.jpeg
 * Supports URL params: width, fit (bounds | cover | crop)
 */
export function getSquareImageUrl(
  baseUrl: string | null | undefined,
  width: number,
  fit: "bounds" | "cover" | "crop" = "bounds",
): string | null {
  if (!baseUrl) return null

  try {
    const url = new URL(baseUrl)
    url.searchParams.set("width", String(width))
    url.searchParams.set("fit", fit)
    return url.toString()
  } catch {
    return baseUrl
  }
}
```

### 11.3 Width by context

| Context                              | Width  | Rationale                                                 |
| ------------------------------------ | ------ | --------------------------------------------------------- |
| Catalog card (mobile)                | `600`  | Crisp on Retina/OLED at 2x, but half the data of full res |
| Catalog card (desktop)               | `600`  | Cards are small, 600 is plenty                            |
| Product detail main image            | `1200` | User needs to read label text, see shade accurately       |
| Product detail thumbnail             | `300`  | Tiny strips below main image                              |
| Cart/checkout item thumbnail         | `200`  | Very small in the cart list                               |
| Order confirmation                   | `200`  | Same as cart                                              |
| Related products / You may also like | `400`  | Smaller cards                                             |
| Color swatch (placeholder fallback)  | `100`  | Only if using image as swatch instead of hex              |

### 11.4 Usage in components

```tsx
// ✅ CORRECT — product card
import { getSquareImageUrl } from "@/lib/utils/square-image"

function ProductCard({ product }) {
  const src = getSquareImageUrl(product.imageUrl, 600)
  return (
    <img
      src={src ?? "/placeholder-product.svg"}
      alt={product.name}
      loading="lazy"
      width={300}
      height={300}
      className="h-full w-full object-cover"
    />
  )
}

// ✅ CORRECT — product detail
function ProductDetailGallery({ product }) {
  const src = getSquareImageUrl(product.imageUrl, 1200)
  return (
    <img
      src={src ?? "/placeholder-product.svg"}
      alt={product.name}
      loading="lazy"
      width={600}
      height={600}
      className="h-full w-full object-cover"
    />
  )
}
```

### 11.5 `<Image>` from next/image — max 50 uses total

`next/image` is for **above-the-fold, hero-tier images only** where LCP performance matters.

**Use `<Image>` for:**

- Hero banner (home page)
- About page hero / team photos
- Kit showcase hero images
- Academy hero (Phase 2)

**Use `<img>` (plain HTML) for:**

- Every product card
- Product detail images
- Cart/checkout thumbnails
- Order confirmation thumbnails
- Related products
- Avatars and profile images
- Any image in a scrollable list

**Why the limit of 50:** Next.js charges per image optimization in some hosting plans. Plain `<img>` + Square CDN params achieves the same result at zero cost.

**Always add `loading="lazy"` to every `<img>` tag.** Exception: hero images above the fold use `loading="eager"` or `fetchpriority="high"`.

### 11.6 The PlaceholderImage component

When a product has no image in Square (custom attribute `image_url` is null):

```tsx
// components/shared/placeholder-image.tsx
export function PlaceholderImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-bg-inset text-fg-tertiary flex items-center justify-center",
        className,
      )}
    >
      {/* Brand mark SVG — a simple M or the Metamorfosis logo mark */}
      <svg viewBox="0 0 40 40" className="h-8 w-8 opacity-30">
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="system-ui"
          fontSize="20"
          fill="currentColor"
        >
          M
        </text>
      </svg>
    </div>
  )
}
```

Never use Unsplash, Picsum, or any external placeholder service.

---

## 12. Reading order for Cursor

Before doing anything, read these in this order:

1. `docs/04_Skills_Code_Structure.md` (this file) — workflow and standards
2. `docs/01_Business_Workflows.md` — what we're building
3. `docs/02_Technical_Integration_Specs.md` — how the systems connect
4. `docs/03_Security_Blueprint.md` — what must never break
5. `docs/00_Schema.sql` — the data model

Then produce the **Phase 0 plan** (archive Academy, create develop, set up folder structure) and wait for the user to paste it into Claude for approval.
