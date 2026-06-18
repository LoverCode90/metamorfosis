# Metamorfosis LLC — Business Workflows & Platform Context

### Context Document for Cursor AI · v2.0

---

## 1. Business Overview

Metamorfosis LLC is a hybrid B2C / B2B e-commerce for a premium beauty supply store located in Ontario, CA. It serves two distinct customer segments:

- **Retail customers (B2C):** General public buying hair care, tools, styling products. No verification required.
- **Salon professionals & students (B2B):** Verified cosmetologists, barbers, estheticians, salon owners, and enrolled beauty students. They unlock restricted professional-grade products and receive a $2 discount on color products.

The platform is built with **Next.js 15 App Router**, **Supabase**, **Square** (payments + inventory), **Shippo** (shipping), and supports two locales: `en` and `es`.

---

## 2. User Roles

| Role                | Description                                            | Key Privileges                                                            |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `standard_customer` | Default role for all new signups                       | Buy retail products, save wishlist                                        |
| `student`           | Verified enrolled beauty student                       | Buy pro products, $2 off color products                                   |
| `professional`      | Verified licensed cosmetologist / barber / esthetician | Buy pro products, $2 off color products, tax exemption depends on profile |
| `salon_owner`       | Verified business with tax certificate                 | Buy pro products, $2 off color products, tax-exempt                       |
| `admin`             | Store owner + developer                                | Full platform access, manual verification review, case management         |

**Guest (unauthenticated):** Not a role in the database. Guests have no profile. They can browse everything and buy retail-only products. Cart lives in `localStorage`.

---

## 3. Route Map

```
/[locale]                          → Home
/[locale]/products                 → Catalog (all products)
/[locale]/products/[slug]          → Product Detail
/[locale]/kits                     → Professional Kits (separate page)
/[locale]/about                    → Brand info, legal, location
/[locale]/cart                     → Cart
/[locale]/checkout                 → Checkout (Cart → Info → Shipping → Payment)
/[locale]/checkout/success         → Order confirmation
/[locale]/profile                  → User profile dashboard (authenticated only)
/[locale]/profile/orders           → Order history
/[locale]/profile/orders/[id]      → Order detail + tracking
/[locale]/profile/verification     → License upload & verification hub
/[locale]/profile/addresses        → Saved addresses
/[locale]/admin                    → Admin panel (admin role only, server-protected)
/[locale]/admin/verifications      → Pending verification queue
/[locale]/admin/cases              → All support cases
/[locale]/admin/orders             → All orders
```

---

## 4. Image Handling Strategy

### 4.1 Image Fallback Chain

Every place that renders a product image must follow this fallback order:

```
variation.image_url
  → parent product_translations.image_url
    → <PlaceholderImage /> component
```

**PlaceholderImage component:** A simple div with a gray background (`bg-gray-100`) and centered text "No image" in a muted color. No external URLs (no Unsplash, no Lorem Picsum). This is intentional — external placeholder images slow down the app and add unpredictable dependencies.

```tsx
// components/ui/PlaceholderImage.tsx
export function PlaceholderImage({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center bg-gray-100", className)}
    >
      <span className="text-xs text-gray-400">No image</span>
    </div>
  )
}
```

### 4.2 Color Products — Image Policy

Color products (shades) are NOT photographed individually. The parent product image (e.g., the color tube or bottle) is used for all shades in that family. `product_variations.image_url` will be `null` for color variations — this is expected, not a bug. The fallback to the parent's image is the correct behavior.

### 4.3 Image Source

Images are synced from Square via webhook and stored as URLs in the database. The sync engine saves the Square-provided CDN image URL directly into `product_translations.image_url` and `product_variations.image_url`. We do not re-host images in Supabase Storage (that's for user-uploaded files only).

---

## 5. Color Products System

### 5.1 What is a Color Product?

A product where `is_color_product = true` in `product_translations`. These are hair color lines where a single product family (e.g., "Fibre Reconstruct") comes in many shades organized by tone family.

### 5.2 Color Family Grouping

Shades are grouped by `color_family` at the parent item level:

| color_family value | Example shades                     |
| ------------------ | ---------------------------------- |
| `naturals`         | 1N, 3N, 5N, 7N, 9N (8–10 shades)   |
| `warm`             | 5R, 6C, 7D, 8G (copper, red, gold) |
| `cool`             | 6A, 7A, 9AA (ash tones)            |
| `pastel`           | 10.12, 10.01 (very light pastels)  |
| `special`          | Vivids, fashion colors, correctors |

**In the catalog:** One card per `(square_product_id, color_family)` group. NOT one card per shade. A line with 83 shades shows as ~5 cards (one per family), not 83 cards.

**In the product detail page:** The selected card opens the full shade selector for that family, showing color swatches built from `hex_color` of each variation.

### 5.3 Color Product Detail Page Layout

The color product detail page has a different layout than standard products:

1. Product name + brand header
2. Price (from the selected variation, or the lowest price in the family as default)
3. Shade selector: circles rendered from `product_variations.hex_color`, labeled with `shade_number`
4. Selected shade name displayed next to the selector label
5. Color chart buttons (see section 5.4)
6. Disclaimer: "Shades shown are a digital approximation. For accurate formulation, consult the printed chart or a licensed professional."
7. Stock status + "License verified at checkout" badge if `is_professional = true`
8. Quantity + Add to Bag button
9. Wishlist button

### 5.4 Color Chart PDFs

Color chart PDFs are **static public files** stored in the `color-charts` Supabase Storage bucket (public visibility).

`product_translations.color_chart_pdf_url` stores the full public URL directly. No signed URLs, no auth — these are marketing/reference materials anyone can access.

**UI Buttons (visible only when `color_chart_pdf_url` is not null):**

```tsx
// "Open color chart" → opens PDF in new browser tab
<a href={color_chart_pdf_url} target="_blank" rel="noopener noreferrer">
  Open color chart
</a>

// "Download PDF" → triggers browser download
<a href={color_chart_pdf_url} download>
  Download PDF
</a>
```

No API route needed. Direct link from the database.

---

## 6. Guest vs Authenticated Experience

### 6.1 What Guests Can Do

- Browse full catalog (all products visible, nothing blurred or hidden)
- View product detail pages
- Read about professional products (with "Professional Only" badge visible)
- Add retail products to cart (stored in `localStorage`)
- Complete checkout for **retail-only** items
- Receive order confirmation by email (provide email in checkout Info step)
- Track order via external carrier URL (Shippo provides this — no internal tracking UI for guests)

### 6.2 What Guests Cannot Do

- Add professional products to checkout (blocked at checkout gate)
- Buy professional kits
- Use wishlist (clicking wishlist icon triggers login modal)
- Save addresses or payment methods
- See order history
- Use the internal Leaflet tracking map
- Access `/profile` routes

### 6.3 Cart Merge on Login

When a guest logs in, their `localStorage` cart is merged with their database cart:

```
Guest cart (localStorage) + Existing DB cart
  → items combined (quantity summed if same variation)
  → merge written to carts + cart_items tables
  → localStorage cart cleared
```

---

## 7. Authentication & Sign-Up Flow

### 7.1 Sign-In Methods

- **Google Sign-In** (OAuth via Supabase)
- **Apple Sign-In** (OAuth via Supabase)
- **Email + Password** (Supabase Auth)

Both OAuth providers are configured in Supabase Dashboard → Authentication → Providers. No API keys needed in `.env` for this.

### 7.2 First-Time User Onboarding

After a new account is created (trigger auto-creates the profile), the user is shown a one-time welcome step before being redirected:

1. **Select your account type:**
   - Regular Customer (no verification needed)
   - Student (upload student contract)
   - Licensed Professional (upload cosmetology/barber/esthetics license)
   - Salon Owner (upload business tax certificate)

2. Based on selection, `profiles.role` is updated and the user is optionally redirected to the verification upload screen.

3. Verification upload can be **skipped** and completed later in `/profile/verification`. However, without approved verification, access to professional products is blocked at checkout.

### 7.3 Admin Account Creation

Admin accounts are NOT created through the public sign-up UI. The process is:

1. Admin signs up normally (Google or email) through the app.
2. Developer runs a SQL update in Supabase Dashboard → SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin'
   WHERE email IN ('developer@domain.com', 'owner@domain.com');
   ```
3. The Next.js middleware checks `role === 'admin'` on the server before rendering any `/admin` route. No client-side admin logic is exposed.

---

## 8. Cart Behavior

### 8.1 Guest Cart

Stored entirely in `localStorage` as a JSON array:

```ts
type LocalCartItem = {
  variationId: string // product_variations.id (our UUID)
  squareVariationId: string // for Square checkout
  productId: string // parent product_translations.square_product_id
  name: string
  imageSrc: string | null
  priceCents: number
  quantity: number
  isProfessional: boolean // used for checkout gate check
}
```

### 8.2 Authenticated Cart

Persisted in `carts` + `cart_items` tables. All cart mutations go through Supabase:

- Add item → `upsert` into `cart_items` (quantity + 1 if already exists)
- Update quantity → `update` `cart_items.quantity`
- Remove item → `delete` from `cart_items`
- Clear cart → `delete` all `cart_items` for the cart

Cart state is managed via **Zustand** with Supabase as the persistence layer (not `localStorage` for auth users).

### 8.3 Wishlist

- Requires authentication. If guest clicks the heart icon, a login modal appears.
- For standard products: saves `(user_id, product_id)` — no variation required.
- For color products: saves `(user_id, product_id, variation_id)` — the specific shade selected.
- Wishlist page includes filter by price, low stock badges.

---

## 9. Checkout Gate & Flow

### 9.1 Checkout Gate Logic

When the user proceeds from the cart to checkout, the server scans all items:

```
Proceed to Checkout
  ↓
Server scan: does cart contain any item where is_professional = true?
  ↓
┌─────────────────────────┐        ┌───────────────────────────┐
│     YES (pro items)     │        │    NO (retail items only) │
└────────────┬────────────┘        └────────────┬──────────────┘
             ↓                                  ↓
   Is user authenticated?           Allow guest OR authenticated
             ↓                      Continue to Info step
    ┌────────┴────────┐
    │ NO              │ YES
    ↓                 ↓
 Show login      Is verification_status = 'approved'?
 modal               ↓
               ┌─────┴──────┐
               │ NO         │ YES
               ↓            ↓
           Show Block    Continue to
           Screen        Info step
```

**Block Screen UI** (when user has pro items but can't proceed):

- "Your cart contains professional-only products."
- Lists the restricted product names.
- Two buttons: **"Verify my license"** → `/profile/verification` | **"Remove professional items"** → clears pro items and continues

### 9.2 Checkout Steps

The checkout is a multi-step flow with a progress indicator:

**Step 1 — Cart (review):** Items, quantities, Order Summary with discounts applied.

**Step 2 — Info:**

- For authenticated users: pre-filled from profile. Editable.
- For guests: full form (full name, email, phone).
- Address input: US-only. Country field locked to "United States". State dropdown with 50 US states only.
- If authenticated and has saved addresses: autocomplete dropdown appears.
- If authenticated and no saved addresses: save address checkbox (pre-checked).
- Terms acceptance: if cart contains any `is_returnable = false` product, a mandatory checkbox appears: _"I understand that chemical products (bleach, developer, permanent color) cannot be returned once shipped."_ The checkout cannot proceed without this checked.

**Step 3 — Shipping:**

- Calls `/api/checkout/shipping-rates` (POST) with the destination address and cart contents.
- Server runs volumetric packing algorithm (see Technical Integration Specs) and calls Shippo to get real rates.
- Displays returned options:
  - Standard Shipping (USPS, 5–7 days) — may be FREE if subtotal ≥ $70
  - Express Shipping (2–3 days) — customer always pays
  - Overnight (next business day) — customer always pays
  - **Pick Up in Store** — always free, address shown: Ontario, CA location
- User selects one option.

**Step 4 — Payment:**

- Square Web Payments SDK card tokenization (iframe).
- For authenticated users: option to save card (pre-checked checkbox).
- Order summary shows: Subtotal, Discount (if applicable), Shipping, Estimated Tax, **Total**.
- The 2.6% Square processing fee is absorbed into pricing — it is NOT shown as a line item.
- Click "Place Order" → POST to `/api/checkout/validate-payment`.

### 9.3 Anti-Tamper: Server-Side Price Calculation

The client sends ONLY:

```json
{
  "items": [{ "variationId": "uuid", "quantity": 2 }],
  "shippingMethod": "standard",
  "addressId": "uuid-or-null",
  "guestEmail": "null-or-email",
  "termsAccepted": true,
  "turnstileToken": "cf-token"
}
```

The server:

1. Validates Turnstile token.
2. Fetches prices from Square Catalog API (source of truth).
3. Applies discounts server-side (see section 10).
4. Calculates tax via Square.
5. Charges via Square Payments API.
6. Creates `orders` + `order_items` records in Supabase.
7. Clears the cart.
8. Sends confirmation email via Resend.
9. Creates an in-app `notification` of type `order_confirmed`.

**If the payload contains a price field → abort immediately (tamper attempt).**

### 9.4 Free Shipping Threshold

- Order subtotal (after discounts, before tax) **≥ $70.00** → Standard Shipping is FREE.
- Below $70 → customer pays actual Shippo rate for Standard.
- Express and Overnight are ALWAYS paid by customer, regardless of subtotal.
- Pick-Up is always free.
- Kit checkout: customer always pays shipping (kits are large/heavy, no free shipping applies).

### 9.5 US-Only Restriction

- The country field in the address form is locked to "United States".
- Shippo only receives US destination addresses.
- No international shipping logic exists in the codebase.

---

## 10. Professional Discounts

### 10.1 Discount Rules

- Applies to: `professional` and `student` roles (both verified, `verification_status = 'approved'`).
- Amount: **$2.00 off per color product** in the cart.
- Applies to: only items where `is_color_product = true`.
- Does NOT apply to non-color professional products, kits, or any other items.

### 10.2 Discount Application

Discount is calculated **server-side** in the checkout API route, never client-side. The server:

1. Fetches the user's role and verification status from Supabase.
2. Loops through cart items.
3. For each item where `is_color_product = true` → subtracts $2.00 from `unit_price_cents`.
4. Writes `discount_cents = 200` on the `order_items` record.
5. Returns the discounted total in the price sheet.

**UI display:** A green "Professional Discount Applied" badge appears in the cart and checkout summary. The line item shows as "Professional discount" or "Student discount" with the total amount in green.

---

## 11. Professional Verification Hub

Located at `/[locale]/profile/verification`.

### 11.1 States

**Unverified (not_applicable):**

- Form: select professional type (student / professional / salon_owner)
- Upload area: drag-and-drop or click to upload (PDF, JPG, PNG, max 10MB)
- "Submit for verification" button (disabled until file is selected)
- File uploads to private `license-verification` Supabase Storage bucket at path `{user_id}/license.{ext}`

**After upload → Gemini Vision AI evaluates the document:**

| Gemini confidence | Action                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| ≥ 0.85, no flags  | Auto-approve: `verification_status = 'approved'`, profile fields updated |
| 0.5 – 0.84        | `verification_status = 'pending_review'` → admin manual queue            |
| < 0.5             | Auto-reject: `verification_status = 'rejected'`                          |

**Pending Review (pending_review):**

- Yellow badge: "Under Manual Review"
- Shows extracted data from Gemini: Name, License Number, Expiration Date
- "The owner is reviewing your document. This usually takes 24–48 hours."
- Upload area disabled until admin resolves it

**Approved (approved):**

- Green badge: "Verified Professional"
- Shows verified credentials and expiration date
- Student accounts show graduation date warning if < 30 days away

**Rejected (rejected):**

- Red badge: "Verification Rejected"
- Shows `profiles.rejection_reason` (written by admin)
- Upload area re-enabled for retry

### 11.2 Student Expiration Auto-Revert

A scheduled Supabase function or cron job (via `pg_cron` or external scheduler) checks daily:

```sql
UPDATE public.profiles
SET role = 'standard_customer',
    verification_status = 'not_applicable'
WHERE role = 'student'
  AND graduation_date < CURRENT_DATE;
```

When this fires, a `notification` of type `verification_rejected` is sent explaining the account was reverted.

---

## 12. Admin Panel

Located at `/[locale]/admin`. Protected server-side — middleware redirects anyone without `role = 'admin'` to a 403 page before any rendering occurs.

### 12.1 Sections

**Dashboard:** Order count, pending verifications, open cases, recent activity.

**Verifications (`/admin/verifications`):**

- Lists all profiles where `verification_status = 'pending_review'`
- Admin clicks a row → sees uploaded document via **60-second signed URL** (generated by server, NOT a public link)
- Admin sees Gemini-extracted data: name, license number, expiration date, confidence score
- Actions:
  - **Approve** → sets `verification_status = 'approved'`, updates profile fields, sends email + notification
  - **Reject** → requires admin to write a rejection reason → sets `verification_status = 'rejected'`, sends email + notification
- Every action is written to `audit_logs` with `admin_id`, `action`, `previous_value`, `new_value`

**Cases (`/admin/cases`):**

- Lists all cases, filterable by status
- Admin can: change status, add prepaid return label URL (`prepaid_label_url`), write `admin_notes`, add messages via `case_messages`
- All status changes logged to `audit_logs`

**Orders (`/admin/orders`):**

- Lists all orders with status and tracking info
- Admin can update `order_status`
- Cannot delete orders

### 12.2 Audit Log

Every admin action must call the `/api/admin/audit` endpoint (internal), which writes to `audit_logs`:

```ts
type AuditEntry = {
  admin_id: string
  action: string // 'verification_approved' | 'case_closed' | etc.
  target_table: string // 'profiles' | 'cases' | 'orders'
  target_id: string
  previous_value: object // snapshot before
  new_value: object // snapshot after
  notes?: string
}
```

This is the legal paper trail for disputed decisions.

---

## 13. Case Management (Returns & Support)

### 13.1 Who Can Open a Case

Only authenticated users, within **14 days of `orders.delivered_at`**. The "Request Return" or "Report an Issue" button calculates `now() - delivered_at` on the frontend and hides itself after 14 days.

### 13.2 Returnable vs Non-Returnable

| Product type                      | `is_returnable` | Within 14 days         | After 14 days |
| --------------------------------- | --------------- | ---------------------- | ------------- |
| Styling brush, gel, wax           | `true`          | Request Return button  | Hidden        |
| Chemical bleach, developer, color | `false`         | Report an Issue button | Hidden        |

The "Report an Issue" button for chemicals is always present within 14 days but does not allow requesting a physical return — only filing a support case.

### 13.3 Evidence Requirements

For reasons `damaged`, `wrong_item`, `defective`:

- Minimum 100 characters in explanation field
- **3 to 5 photos required** (packaging, shipping label, damage)
- "Submit Case" button disabled until ≥ 3 photos uploaded
- Photos stored in private `case-evidence` bucket at `{case_id}/{index}.{ext}`

### 13.4 Return Shipping Logic

| Fault                                               | Who pays     | Label type                                     |
| --------------------------------------------------- | ------------ | ---------------------------------------------- |
| Customer (`no_longer_needed`, `ordered_by_mistake`) | Customer     | Shippo return label, cost deducted from refund |
| Merchant (`wrong_item`, `defective`, `damaged`)     | Metamorfosis | Prepaid USPS label emailed to customer         |

### 13.5 Evidence Auto-Delete on Case Close

When case `status` is updated to `'closed'`, the API route must:

1. Loop through `cases.evidence_images_urls`
2. Call `supabase.storage.from('case-evidence').remove([...paths])`
3. Then update the case status in the database

This keeps the private storage bucket from accumulating indefinitely. The case record itself (text data) is kept permanently for legal records.

---

## 14. Professional Kits

### 14.1 Overview

Two kits available exclusively to verified professionals and students:

- **BBCos Color Kit** — professional color line starter set
- **Nutrapel Color Kit** — professional treatment + color set

These are NOT in the main product catalog. They have their own page at `/[locale]/kits`.

### 14.2 Purchase Rules

- Requires login + `verification_status = 'approved'`
- **One-time purchase per user per kit, for life** — enforced by `unique(user_id, kit_id)` in `kit_purchases` table
- If a user has already purchased a kit: the "Add to Bag" button is replaced with "Already in your collection" (disabled)
- Customer **always pays shipping** for kits (no free shipping threshold applies)

### 14.3 Kit Checkout Flow

Completely separate from the main checkout. A simplified flow:

1. Kit page → "Get this kit" button → auth check + verification check
2. Kit checkout: confirm kit contents + address + shipping method selection via Shippo
3. Square payment
4. Creates a `kit_purchases` record (status: `pending` → `confirmed`)
5. Creates an `orders` record with `shipping_method = kit_large` context
6. Sends email + in-app notification of type `kit_purchase_confirmed`

---

## 15. Order History & Tracking

### 15.1 Authenticated Users

Located at `/[locale]/profile/orders`. Shows all past orders with status badges.

Order detail page (`/profile/orders/[id]`) includes:

- Order items with images and prices
- Order status timeline
- **Leaflet tracking map:**
  - `interactive: false` (no zoom, no pan — display only)
  - Two markers: Ontario, CA (origin) and customer delivery address
  - Polyline between origin and destination
  - A package icon animated along the line to represent shipment progress
  - Tracking number + carrier displayed below the map
- Return/Report buttons if within 14-day window and product rules allow

### 15.2 Guest Users

No internal tracking UI. After order confirmation, the guest receives an email with:

- Order summary
- The `tracking_url` from Shippo (external carrier tracking page)

No `/track/[id]` page exists. Guests who want tracking history are encouraged to create an account.

---

## 16. In-App Notifications

Stored in `notifications` table. Displayed as a badge in the nav (unread count) and a dropdown list.

### 16.1 Notification Triggers

| Event                     | Type                     | Triggered by                          |
| ------------------------- | ------------------------ | ------------------------------------- |
| Order placed successfully | `order_confirmed`        | checkout API route                    |
| Order shipped             | `order_shipped`          | Square webhook or manual admin update |
| Order delivered           | `order_delivered`        | Square webhook or manual admin update |
| Order canceled            | `order_canceled`         | admin action                          |
| Case opened               | `case_opened`            | case creation API                     |
| Case status changed       | `case_updated`           | admin action                          |
| Case closed               | `case_closed`            | admin action                          |
| Verification submitted    | `verification_pending`   | verification upload API               |
| Verification approved     | `verification_approved`  | admin action or Gemini auto-approve   |
| Verification rejected     | `verification_rejected`  | admin action or Gemini auto-reject    |
| Kit purchased             | `kit_purchase_confirmed` | kit checkout API                      |

Notifications are created server-side via `service_role` key (not by the user client).

---

## 17. Email Notifications (Resend)

The email system uses the `EmailProvider` interface pattern (Resend now, AWS SES later — swap by changing the implementation class only).

### 17.1 Email Templates Required

| Template ID              | Subject                                     | Trigger                          |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| `order-confirmed`        | "Your order is confirmed 🎉"                | Order placed                     |
| `order-shipped`          | "Your order is on its way!"                 | Shipment created in Shippo       |
| `order-delivered`        | "Your order was delivered"                  | Status update                    |
| `order-canceled`         | "Your order has been canceled"              | Admin cancels order              |
| `case-opened`            | "We received your support request"          | Case created                     |
| `case-status-update`     | "Update on your case #XXXX"                 | Case status changed              |
| `case-closed`            | "Your case has been resolved"               | Case closed                      |
| `verification-pending`   | "Your license is under review"              | Gemini returns medium confidence |
| `verification-approved`  | "You're verified! Welcome to Pro access 🔓" | Verification approved            |
| `verification-rejected`  | "Action needed: re-upload your license"     | Verification rejected            |
| `kit-purchase-confirmed` | "Your professional kit is on its way!"      | Kit order confirmed              |
| `password-reset`         | "Reset your Metamorfosis password"          | Auth (Supabase handles this)     |

All emails are in both English and Spanish — the language is determined by the user's `locale` preference (stored or inferred from their browser at signup).

---

## 18. Low Stock Badges

Threshold: **4 units or fewer** (`inventory_count <= 4` in `product_variations`).

When triggered, show a red/orange badge:

- On product cards: "Only X left"
- On product detail page: "Only X left — order soon"
- In cart: "Only X left" warning on the item row
- This value comes from `product_variations.inventory_count`, which is synced from Square via webhook on every catalog update

---

## 19. Related Products ("You May Also Like")

Displayed on:

- Product detail pages (below the description tabs)
- Cart page (at the bottom, "You may also like")

**Data source:** `product_translations.recommended_skus` — an array of SKUs set manually or populated during the Square sync. The sync engine resolves these SKUs to full product objects for display.

Rendering rules:

- Show max 4 cards
- If `recommended_skus` is empty, fall back to products in the same `categories_hierarchy`
- Apply the same image fallback logic (variation → parent → placeholder)
- Professional products in recommendations show the "Professional" badge even in this section

---

## 20. i18n Strategy

- **Supported locales:** `en` (default), `es`
- **Routing:** `/en/products`, `/es/products` — locale prefix always present
- **Library:** `next-intl`
- **Canonical URLs:** Each page declares `<link rel="canonical" href="/en/..." />` to prevent duplicate content indexing between `/en/` and `/es/` versions
- **Translation files:** `messages/en.json` and `messages/es.json` for static UI strings
- **Dynamic content** (product names, descriptions): stored as bilingual columns in Supabase (`name_en`, `name_es`, etc.) — fetched in the user's active locale
- **DeepL translation** is triggered automatically in the Square sync webhook for any new or updated product name/description

---

## 21. Academy (Future — Phase 2)

The academy feature (in-person courses for cosmetology, colorimetry, nanoplasty, etc.) is architected in the database (`academy_courses`, `academy_enrollments`) but is **not implemented in v1**.

The About page may mention the academy's existence. The Profile page has an "Academy Courses" section that shows a placeholder state: _"No active courses yet. Explore our programs."_ with a link that is disabled or leads to a coming-soon message.

No checkout, enrollment, or course viewing logic is built in v1.

---

## 22. Square Processing Fee Policy

The 2.6% Square processing fee is **not displayed to the customer** as a line item. It is built into product pricing by the store owner. When Square processes the payment, the fee is deducted from the merchant payout — the customer sees and pays the catalog price. This is configured at the Square account level, not in the application code.

---

## 23. Storage Buckets Summary

| Bucket name            | Visibility  | Contents                                                                   | Notes                                   |
| ---------------------- | ----------- | -------------------------------------------------------------------------- | --------------------------------------- |
| `license-verification` | **Private** | User-uploaded license/contract/certificate docs                            | Signed URLs (60s) for admin review only |
| `case-evidence`        | **Private** | 3–5 photos per case (damage evidence)                                      | Deleted when case is closed via API     |
| `product-images`       | **Public**  | Synced from Square CDN (image URLs stored in DB, may not need this bucket) | If Square CDN goes down, migrate here   |
| `color-charts`         | **Public**  | Color chart PDFs — direct URL stored in `color_chart_pdf_url`              | No auth needed, anyone can download     |
| `kit-assets`           | **Public**  | Kit marketing images and additional PDFs                                   | Static files                            |
