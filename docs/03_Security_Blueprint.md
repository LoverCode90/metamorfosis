# Metamorfosis LLC — Security Blueprint

### Context Document for Cursor AI · v2.0

---

## 1. Threat Model Overview

Metamorfosis handles three categories of sensitive data:

1. **Payment data** — never touches our servers; tokenized via Square Web Payments SDK
2. **Personal verification documents** — professional licenses, student contracts, business certificates
3. **Customer data** — addresses, order history, contact info

The platform must defend against:

- Bot abuse on signup, checkout, and license upload endpoints
- Price tampering at checkout (client manipulating prices in DevTools)
- Unauthorized access to private documents (licenses, case evidence)
- SQL injection, XSS, and CSRF
- Privilege escalation (regular users attempting admin actions)
- Race conditions on inventory at checkout

---

## 2. Authentication & Authorization

### 2.1 Auth Providers

Supabase Auth handles three sign-in methods:

- Google OAuth
- Apple Sign In
- Email + Password

OAuth providers are configured in Supabase Dashboard → Authentication → Providers. The OAuth client IDs and secrets live in Supabase, not in the app's environment variables.

### 2.2 Session Handling

All authenticated routes use **Supabase server-side session validation** via the `@supabase/ssr` package. Client-side session checks alone are never trusted for protected actions.

```ts
// middleware.ts — runs on every request
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // /profile/* requires auth
  if (req.nextUrl.pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // /admin/* requires admin role — server-side DB check
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', req.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', req.url))
    }
  }
}
```

### 2.3 Admin Account Creation — Never via UI

The public sign-up flow **never** offers an admin option. Admin accounts are created exclusively through this process:

1. The future admin signs up normally (Google or email) through the public flow.
2. The developer runs a SQL update directly in Supabase Dashboard:
   ```sql
   UPDATE public.profiles SET role = 'admin'
   WHERE email IN ('developer@yourdomain.com', 'owner@yourdomain.com');
   ```
3. No admin promotion exists in any API route. Any attempt to update `profiles.role` via the app is blocked by RLS — only the service role can change it, and the service role is only used in trusted server contexts.

### 2.4 Role-Based Access Control

| Action                       | Required Role                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------- |
| View catalog                 | None (public)                                                                    |
| Add to cart                  | None (guest cart in localStorage)                                                |
| Checkout retail items        | None (guest checkout allowed)                                                    |
| Checkout professional items  | `professional`, `student`, `salon_owner` with `verification_status = 'approved'` |
| Buy professional kits        | Same as above                                                                    |
| Upload verification document | Authenticated user (any role)                                                    |
| View own orders              | Authenticated user                                                               |
| View any user's orders       | `admin`                                                                          |
| Approve/reject verifications | `admin`                                                                          |
| Update case status           | `admin`                                                                          |
| Modify product catalog       | `admin` (and only via dashboard, not via app — Square is source of truth)        |

All role checks happen server-side via RLS policies and middleware. Client UI may hide buttons based on role, but the server never trusts that.

---

## 3. Row Level Security (RLS) Strategy

**Every table has RLS enabled.** No table is open to anonymous full reads or writes unless explicitly designed for public access (`product_translations`, `product_variations`, `professional_kits`, `academy_courses`).

The full RLS policy set is defined in the database schema document. Key principles:

- Users can only read and modify their own rows (matched by `user_id = auth.uid()`).
- Admins have full read/write on all tables via the `is_admin()` helper function.
- Service role (used in server-side API routes) bypasses RLS by design and must be used carefully — only in trusted server code.
- The `service_role` key never appears in any client-side bundle.

```ts
// Two Supabase client variants:
// 1. Anon client — for client and server components, respects RLS
const supabase = createBrowserClient(url, anonKey)

// 2. Service role client — for trusted server actions only
const supabaseAdmin = createClient(url, serviceRoleKey)
```

---

## 4. Cloudflare Turnstile (Bot Mitigation)

Turnstile validates that the request comes from a human (or at least not a known bot). It is required on:

- Sign up form
- Sign in form (after 3 failed attempts)
- Checkout payment submission
- License verification upload
- Contact form (if added later)

### 4.1 Client-Side Widget

```tsx
// components/TurnstileWidget.tsx
import Turnstile from "react-turnstile"

export function TurnstileWidget({
  onVerify,
}: {
  onVerify: (token: string) => void
}) {
  return (
    <Turnstile
      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onVerify={onVerify}
      theme="light"
    />
  )
}
```

### 4.2 Server-Side Verification

```ts
// lib/turnstile.ts
export async function verifyTurnstileToken(
  token: string,
  ip: string,
): Promise<boolean> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
        remoteip: ip,
      }),
    },
  )

  const data = await res.json()
  return data.success === true
}
```

Every protected API route validates the token before processing:

```ts
// api/checkout/validate-payment/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? ""

  const isHuman = await verifyTurnstileToken(body.turnstileToken, ip)
  if (!isHuman) {
    return NextResponse.json(
      { error: "Turnstile verification failed" },
      { status: 400 },
    )
  }

  // ... continue with checkout
}
```

If Turnstile verification fails → return 400 immediately, do not process the request.

---

## 5. Rate Limiting

Rate limits are enforced at edge middleware using **Upstash Redis** (or Vercel KV if hosting on Vercel).

```ts
// lib/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export const ratelimits = {
  shippingRates: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
  }),
  paymentSubmit: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 m"),
  }),
  licenseUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
  }),
  authAttempts: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
  }),
  contactForm: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
  }),
}
```

Used in each route:

```ts
const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous"
const { success } = await ratelimits.paymentSubmit.limit(ip)
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
```

Rate limit response includes `Retry-After` header in seconds.

---

## 6. Anti-Tamper: Server-Side Price Calculation

**The client never specifies prices, taxes, shipping costs, or discounts.** All financial values are computed server-side using Square Catalog API as the source of truth.

### 6.1 The Checkout Payload Schema (Zod)

```ts
import { z } from "zod"

const CheckoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          variationId: z.string().uuid(),
          quantity: z.number().int().positive().max(99),
        }),
      )
      .min(1)
      .max(50),
    shippingMethod: z.enum(["standard", "express", "overnight", "pickup"]),
    addressId: z.string().uuid().nullable(),
    guestEmail: z.string().email().nullable(),
    termsAccepted: z.boolean(),
    turnstileToken: z.string().min(1),
  })
  .strict() // .strict() rejects unknown keys

// In the route:
const parsed = CheckoutSchema.safeParse(await req.json())
if (!parsed.success) {
  return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
}

// If the payload had 'price', 'total', 'discount', or any other unknown field,
// .strict() rejects it. This is the tamper detection.
```

### 6.2 Server-Side Recalculation

```ts
// api/checkout/validate-payment/route.ts (server)
async function calculateOrderTotal(items, userRole) {
  // 1. Fetch current prices from Square (source of truth)
  const variationIds = items.map(i => i.squareVariationId)
  const catalog = await squareClient.catalogApi.batchRetrieve({
    objectIds: variationIds,
  })

  // 2. Calculate subtotal from authoritative prices
  let subtotalCents = 0
  let discountCents = 0

  for (const item of items) {
    const catalogItem = catalog.objects.find(o => o.id === item.squareVariationId)
    const priceCents = catalogItem.itemVariationData.priceMoney.amount

    subtotalCents += priceCents * item.quantity

    // Server-side discount: $2 off color products for professionals/students
    if (item.isColorProduct && ['professional', 'student'].includes(userRole)) {
      discountCents += 200 * item.quantity
    }
  }

  // 3. Shipping
  const shippingCents = subtotalCents >= 7000 && shippingMethod === 'standard'
    ? 0
    : await calculateShipping(items, address, shippingMethod)

  // 4. Tax via Square (authoritative)
  const taxCents = await squareClient.calculateTax({...})

  return { subtotalCents, discountCents, shippingCents, taxCents,
           totalCents: subtotalCents - discountCents + shippingCents + taxCents }
}
```

The client receives the calculated total only after the server computes it. Square processes the payment for that exact amount.

---

## 7. Input Validation & Sanitization

### 7.1 Zod Schemas for Every Endpoint

Every API route validates its input with Zod before doing anything else. No exceptions.

```ts
// Example: address creation
const AddressSchema = z
  .object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2).max(100),
    phoneNumber: z.string().regex(/^\+?1?\d{10,15}$/),
    streetLine1: z.string().min(3).max(200),
    streetLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.enum(["AL", "AK", "AZ", "AR", "CA", "CO" /* all 50 US states */]),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    isDefault: z.boolean().optional(),
  })
  .strict()
```

### 7.2 HTML Sanitization (XSS Prevention)

Product descriptions from Square may contain rich text. Before rendering with `dangerouslySetInnerHTML`, sanitize with `isomorphic-dompurify`:

```tsx
import DOMPurify from "isomorphic-dompurify"

export function ProductDescription({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

Never trust any HTML coming from external sources (Square sync, user input, AI-generated content).

### 7.3 SQL Injection Prevention

**Never write raw SQL with string interpolation.** Always use the Supabase query builder, which parameterizes automatically:

```ts
// ✅ SAFE — query builder
await supabase.from("orders").select("*").eq("user_id", userId)

// ❌ DANGER — never do this
await supabase.rpc("exec_sql", {
  query: `SELECT * FROM orders WHERE user_id = '${userId}'`,
})
```

If a complex query truly needs `.rpc()`, define it as a parameterized PL/pgSQL function in Supabase — never as a dynamic string.

---

## 8. Storage Security

### 8.1 Bucket Configuration

| Bucket                 | Visibility  | Purpose                                                                  | Access Pattern                                |
| ---------------------- | ----------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| `license-verification` | **Private** | Professional licenses & contracts                                        | Signed URLs (60s) for admin viewing           |
| `case-evidence`        | **Private** | Case damage photos (3-5 per case)                                        | Signed URLs (60s); auto-deleted on case close |
| `product-images`       | Public      | Synced from Square (rarely needed; usually use Square CDN URLs directly) | Direct URL                                    |
| `color-charts`         | Public      | Color chart PDFs                                                         | Direct URL                                    |
| `kit-assets`           | Public      | Kit marketing assets                                                     | Direct URL                                    |

### 8.2 RLS for Storage

Storage RLS policies are configured in Supabase Dashboard → Storage → Policies. Example for `license-verification`:

```sql
-- Users can upload to their own folder
create policy "Users can upload own license"
on storage.objects for insert
with check (
  bucket_id = 'license-verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own files
create policy "Users can read own license"
on storage.objects for select
using (
  bucket_id = 'license-verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read all
create policy "Admins read all licenses"
on storage.objects for select
using (
  bucket_id = 'license-verification'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
```

### 8.3 Signed URL Generation (Server-Only)

```ts
// api/admin/verifications/[id]/document-url/route.ts
export async function GET(req, { params }) {
  // Verify admin
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = await checkAdmin(user.id)
  if (!isAdmin) return new NextResponse('Forbidden', { status: 403 })

  // Generate signed URL — 60 second expiry
  const { data: profile } = await supabase
    .from('profiles')
    .select('document_url')
    .eq('id', params.id)
    .single()

  const { data: signedUrl } = await supabase.storage
    .from('license-verification')
    .createSignedUrl(profile.document_url, 60)

  return NextResponse.json({ url: signedUrl?.signedUrl })
}
```

The signed URL is returned to the admin's browser and expires in 60 seconds. After that, the file is unreachable again until a new URL is generated.

### 8.4 Case Evidence Auto-Delete

When a case status transitions to `'closed'`, the API route must:

1. Read the case's `evidence_images_urls` array
2. Delete each file from the `case-evidence` bucket
3. Then update the case status

This prevents storage bloat over time. The case record itself (text data) is kept for audit/legal purposes — only the images are removed.

```ts
// api/admin/cases/[id]/close/route.ts
export async function POST(req, { params }) {
  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return adminCheck.response

  // 1. Fetch evidence paths
  const { data: caseData } = await supabaseAdmin
    .from("cases")
    .select("evidence_images_urls")
    .eq("id", params.id)
    .single()

  // 2. Extract storage paths
  const paths = caseData.evidence_images_urls.map(extractPath)

  // 3. Delete from storage
  if (paths.length > 0) {
    await supabaseAdmin.storage.from("case-evidence").remove(paths)
  }

  // 4. Update case
  await supabaseAdmin
    .from("cases")
    .update({
      status: "closed",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", params.id)

  // 5. Audit log
  await writeAuditLog({
    action: "case_closed",
    target_table: "cases",
    target_id: params.id,
  })

  return NextResponse.json({ ok: true })
}
```

---

## 9. CORS Policy

CORS is configured in `next.config.js` to only allow your own domain. The app does not expose its API to any external origin.

```js
// next.config.js
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL // e.g. https://metamorfosis.com

module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: ALLOWED_ORIGIN },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ]
  },
}
```

**Webhook endpoints are an exception.** Square and Shippo webhooks come from their own domains:

```ts
// api/webhooks/square/route.ts
const ALLOWED_WEBHOOK_ORIGINS = ["squareup.com", "connect.squareupsandbox.com"]

export async function POST(req: NextRequest) {
  // Signature validation (not Origin check) is the real security
  const signature = req.headers.get("x-square-signature")
  const body = await req.text()

  const valid = validateSquareSignature(
    body,
    signature,
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
  )
  if (!valid) return new NextResponse("Invalid signature", { status: 401 })

  // ... process webhook
}
```

For webhooks, the real security is the **signature verification**, not the origin header (which can be spoofed).

---

## 10. Webhook Signature Validation

All incoming webhooks validate cryptographic signatures before processing.

### 10.1 Square Webhook

```ts
import crypto from "crypto"

function validateSquareSignature(
  body: string,
  signature: string,
  key: string,
): boolean {
  const hmac = crypto.createHmac("sha256", key)
  hmac.update(body)
  const computed = hmac.digest("base64")
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
}
```

Use `timingSafeEqual` to prevent timing attacks. Never use `===` for crypto comparisons.

### 10.2 Shippo Webhook

Shippo uses HMAC-SHA256 with a configured webhook secret:

```ts
function validateShippoSignature(body: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", process.env.SHIPPO_WEBHOOK_SECRET!)
  hmac.update(body)
  return crypto.timingSafeEqual(
    Buffer.from(hmac.digest("hex")),
    Buffer.from(signature),
  )
}
```

---

## 11. Audit Logs

Every administrative action writes to the `audit_logs` table. This is the legal paper trail for disputed decisions.

### 11.1 What Gets Logged

| Action                  | Table    | Logged Fields                              |
| ----------------------- | -------- | ------------------------------------------ |
| `verification_approved` | profiles | role change, verification fields populated |
| `verification_rejected` | profiles | rejection reason, document URL             |
| `gemini_auto_approved`  | profiles | confidence score, extracted data           |
| `gemini_auto_rejected`  | profiles | confidence score, flags                    |
| `case_status_changed`   | cases    | from status → to status, admin notes       |
| `case_closed`           | cases    | resolution timestamp                       |
| `order_status_changed`  | orders   | from status → to status                    |
| `order_refunded`        | orders   | refund amount, reason                      |
| `role_changed`          | profiles | from role → to role                        |

### 11.2 Audit Log Helper

```ts
// lib/auditLog.ts
export async function writeAuditLog(params: {
  action: string
  targetTable: string
  targetId: string
  previousValue?: object
  newValue?: object
  notes?: string
}) {
  const { user } = await getServerSession()
  if (!user) throw new Error("No admin context")

  await supabaseAdmin.from("audit_logs").insert({
    admin_id: user.id,
    action: params.action,
    target_table: params.targetTable,
    target_id: params.targetId,
    previous_value: params.previousValue ?? null,
    new_value: params.newValue ?? null,
    notes: params.notes ?? null,
  })
}
```

### 11.3 Read-Only Audit Logs

The `audit_logs` table is **append-only**. There is no UPDATE or DELETE policy — even admins cannot modify the log.

```sql
-- Already in schema:
create policy "Admins can read all audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- No INSERT, UPDATE, or DELETE policy for users — only the service role
-- (used inside trusted server functions) can write to this table.
```

---

## 12. Environment Variable Security

### 12.1 Public vs Private Variables

| Prefix          | Where Used                                   | Examples                                                                  |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_*` | Bundled into client code, visible in browser | Site URLs, OAuth client IDs, Square app ID, Turnstile site key            |
| No prefix       | Server-only, never in client bundle          | API secrets, service role key, webhook signing keys, OAuth client secrets |

**Critical rule:** Any variable holding a secret must NOT have `NEXT_PUBLIC_` prefix. If Cursor proposes adding `NEXT_PUBLIC_` to a secret variable, that's a security incident — block it.

### 12.2 Variables That MUST Stay Server-Only

```
SUPABASE_SERVICE_ROLE_KEY
SQUARE_ACCESS_TOKEN
SQUARE_WEBHOOK_SIGNATURE_KEY
SHIPPO_API_KEY
SHIPPO_WEBHOOK_SECRET
DEEPL_API_KEY
RESEND_API_KEY
GEMINI_API_KEY
TURNSTILE_SECRET_KEY
```

If any of these appear in a `'use client'` file or get imported into a client component, that's a critical bug.

### 12.3 Variables Safe to Expose

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SQUARE_APP_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  (restrict by HTTP referrer in Google Cloud Console)
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS
```

---

## 13. Google Maps API Key Protection

The Maps API key is publicly visible in the browser bundle. To prevent abuse:

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Edit the Maps API key
3. Set **Application restrictions** to **HTTP referrers**
4. Add allowed referrers:
   - `https://yourdomain.com/*`
   - `https://*.vercel.app/*` (for preview deployments)
   - `http://localhost:3000/*` (for development)
5. Set **API restrictions** to only enable: Maps JavaScript API, Places API (New), Geocoding API

This way, even if someone copies the key, they cannot use it from their own domain.

---

## 14. Stock Concurrency at Checkout

Detailed in Technical Integration Specs section 4, but summarized here for security context:

The Supabase `inventory_count` is a **cached value** for UI display. Before charging the customer, the API route always validates against the live Square inventory count. If Square reports insufficient stock, the payment is aborted with a 409 response.

This prevents:

- Two customers buying the last unit simultaneously (one gets charged, then we can't fulfill)
- A customer adding to cart while the in-store POS sells the same item

The edge case of two simultaneous purchases is mitigated by post-payment reconciliation: after both orders are created, a check runs to detect oversold inventory and flags the second order for manual admin intervention.

---

## 15. Content Security Policy (CSP)

Set strict CSP headers to mitigate XSS:

```js
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://challenges.cloudflare.com
    https://web.squarecdn.com
    https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' blob: data: https:;
  connect-src 'self' https://*.supabase.co https://*.squareup.com
    https://api.shippo.com https://api.deepl.com;
  frame-src https://challenges.cloudflare.com https://web.squarecdn.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\n/g, " ")
  .trim()
```

`frame-ancestors 'none'` prevents the site from being embedded in iframes (clickjacking protection).

---

## 16. Pre-Production Security Checklist

Before going live, verify every item:

- [ ] All RLS policies enabled and tested with non-admin user
- [ ] Service role key never appears in client bundle (search the build output)
- [ ] Turnstile working on signup, checkout, and license upload
- [ ] Rate limits configured on all sensitive endpoints
- [ ] Zod validation with `.strict()` on every POST/PUT route
- [ ] Webhook signature validation tested for Square and Shippo
- [ ] CORS restricted to production domain
- [ ] CSP headers configured
- [ ] Google Maps API key restricted by HTTP referrer
- [ ] Storage buckets: `license-verification` and `case-evidence` are private
- [ ] Signed URLs working with 60s expiry
- [ ] Case auto-delete logic verified (close a test case, confirm files gone)
- [ ] Admin role assignment tested (cannot promote via API, only via dashboard SQL)
- [ ] HTTPS enforced (handled by Vercel/hosting)
- [ ] Environment variables: no secrets prefixed with `NEXT_PUBLIC_`
- [ ] Error messages don't leak stack traces or internal details to clients
- [ ] Audit log writes verified for all admin actions
- [ ] Payment recalculated server-side; tamper attempts rejected with 400
