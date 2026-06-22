# Metamorfosis LLC — Technical Integration Specifications

### Context Document for Cursor AI · v2.0

---

## 1. Square API Integration

### 1.1 Architecture: Source of Truth

Square is the **absolute source of truth** for:

- Product catalog (items, variations, prices, inventory)
- Payment processing
- Tax calculation

Supabase is the **operational mirror** for:

- Translated content (EN/ES via DeepL)
- Professional flags (`is_professional`, `is_returnable`, `is_color_product`, etc.)
- Order history, cases, user profiles

These two must stay in sync via the webhook engine described below.

---

### 1.2 Catalog Data Model: ITEM vs ITEM_VARIATION

Square has two levels:

```
ITEM (parent)
  └── ITEM_VARIATION (child, 1 to N)
```

**Mapping to our database:**

| Square                                             | Our DB                                   |
| -------------------------------------------------- | ---------------------------------------- |
| `CatalogItem`                                      | `product_translations`                   |
| `CatalogItemVariation`                             | `product_variations`                     |
| `item.id`                                          | `product_translations.square_product_id` |
| `variation.id`                                     | `product_variations.square_variation_id` |
| `variation.item_variation_data.sku`                | `product_variations.sku`                 |
| `variation.item_variation_data.price_money.amount` | `product_variations.price_cents`         |

**Important:** A product like "Fibre Reconstruct A1" is ONE `ITEM` with up to 83 `ITEM_VARIATION` children (one per shade). Each variation has its own SKU, price, and inventory count.

---

### 1.3 Square Custom Attributes Required

These must be created in Square Dashboard → **Items → Custom Attributes** before syncing.

#### At the ITEM level:

| Attribute Name        | Type        | Allowed Values                                    |
| --------------------- | ----------- | ------------------------------------------------- |
| `is_professional`     | `BOOLEAN`   | `true`, `false` (returned as booleanValue)        |
| `is_returnable`       | `BOOLEAN`   | `true`, `false` (returned as booleanValue)        |
| `package_class`       | `SELECTION` | `tiny`, `small`, `medium`, `box_set`, `kit_large` |
| `is_color_product`    | `BOOLEAN`   | `true`, `false` (returned as booleanValue)        |
| `color_family`        | `SELECTION` | `naturals`, `warm`, `cool`, `pastel`, `special`   |
| `color_chart_pdf_url` | `TEXT`      | Full public URL to the PDF                        |

#### At the ITEM_VARIATION level:

| Attribute Name | Type     | Notes                                      |
| -------------- | -------- | ------------------------------------------ |
| `weight_lb`    | `NUMBER` | Real weighed value in pounds, e.g. `0.802` |
| `hex_color`    | `TEXT`   | Only for color products, e.g. `#C4956A`    |
| `shade_number` | `TEXT`   | e.g. `7N`, `3R`, `10NA`                    |
| `key_features` | `TEXT`   | Used to store string value                 |

> **Action required:** Change all existing `Y`/`N` values for `is_returnable` to `true`/`false` before connecting the sync webhook.

---

### 1.4 Webhook Sync Engine

**Endpoint:** `POST /api/webhooks/square`

**Trigger:** Square fires `catalog.version.updated` on any item change.

**Validation (first thing, before any processing):**

```ts
const signature = req.headers["x-square-signature"]
const isValid = validateSquareSignature(
  body,
  signature,
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
)
if (!isValid) return res.status(403).end()
```

**Sync algorithm:**

```
1. Receive webhook → validate signature
2. Fetch full catalog from Square: GET /v2/catalog/list?types=ITEM,ITEM_VARIATION,CUSTOM_ATTRIBUTE_DEFINITION
3. For each ITEM:
   a. Extract custom attributes (is_professional, is_returnable, package_class, etc.)
   b. Resolve SELECTION UIDs via CUSTOM_ATTRIBUTE_DEFINITION map, and BOOLEAN via booleanValue
   c. Check if name_en or description_en changed vs Supabase record
      → If changed: call DeepL API once → get name_es + description_es
      → Upsert into product_translations
   d. For each ITEM_VARIATION child:
      → Upsert into product_variations
      → Update inventory_count from Square's inventory API
4. For deleted items:
   a. Square marks them as is_deleted: true
   b. Set product_translations.is_active = false (soft delete)
   c. DO NOT hard delete — carts, wishlists, and order history reference these IDs
```

**Handling deleted products in active carts/wishlists:**
When `is_active = false` on a product, the cart API route must:

- Filter it out from cart display with a notice: _"One item was removed from your cart because it's no longer available."_
- Remove it from `cart_items`
- Keep it in `wishlists` but show a "No longer available" badge

---

### 1.5 Inventory Sync

Inventory counts come from Square's Inventory API (separate from catalog):
`POST /v2/inventory/counts/batch-retrieve`

This is called:

1. During the full catalog sync (webhook)
2. **At checkout — immediately before charging** (see section 6: Race Condition Prevention)

---

## 2. Shippo Integration

### 2.1 Address Validation & Delivery Zone Check

Before showing shipping rates, the destination address must be validated via Shippo's Address Validation endpoint.

**When to validate:**

- When the user saves a new address in their profile
- When the user enters an address in checkout Info step
- Before calling the shipping rates endpoint

**Endpoint:** `POST /api/checkout/validate-address` → calls Shippo `POST /v1/addresses/` with `validate: true`

**Shippo validation response handling:**

```ts
// Shippo returns validation_results in the address object
type ShippoAddressValidation = {
  is_valid: boolean
  messages: Array<{
    source: string
    type: "warning" | "error"
    code: string
    text: string
  }>
}
```

**UI behavior based on result:**

| Scenario                              | UI Action                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `is_valid: true`                      | Allow proceeding                                                                                    |
| `is_valid: false`, correctable (typo) | Show Shippo's suggested correction, ask user to confirm                                             |
| `is_valid: false`, undeliverable area | Show error: _"We're unable to deliver to this address. Please check it or choose in-store pickup."_ |
| No carrier coverage (remote area)     | Show error: _"No shipping carriers service this area. Please select in-store pickup."_              |
| Valid but no rates returned by Shippo | Offer only in-store pickup                                                                          |

**Scope restriction:** The address form only accepts US addresses. The country field is locked to `"US"`. State is a controlled dropdown of 50 US states only. If Shippo returns an address outside the US (shouldn't happen), reject it.

---

### 2.2 Apartment / Unit Field Handling

The address form uses two fields:

```
Street Line 1: [required] — e.g. "123 Desert Valley St"
Street Line 2: [optional] — Apt, Suite, Unit, Floor, etc.
```

If the user's `street_line_1` input contains keywords like "apt", "unit", "suite", "#", or a bare number after the street, the form should display an inline hint:

_"If this is an apartment or unit, add it in the field below."_

**Important:** `street_line_2` is optional at the form level, but Shippo's address validation may flag the address if an apartment building is detected and no unit is provided. Handle this with a warning (not a blocker).

---

### 2.3 Google Places Autocomplete — Address Input

Used on: checkout Info step address field, `/profile/addresses` save address form.

**Integration:** Google Places API — `Autocomplete` with `types: ['address']` and `componentRestrictions: { country: 'us' }`.

**Debounce strategy:** Do NOT call the API on every keystroke. Use a **300ms debounce** or, preferably, trigger only after the input contains at least **5 characters**. This reduces API credit consumption significantly.

```ts
// Pseudocode — actual implementation uses the @react-google-maps/api library
useEffect(() => {
  if (inputValue.length < 5) return
  const timer = setTimeout(() => {
    fetchPlacePredictions(inputValue)
  }, 300)
  return () => clearTimeout(timer)
}, [inputValue])
```

**When user selects a suggestion:**

1. Call Places Details API to get the full structured address.
2. Parse the response to populate:
   - `street_line_1`: `street_number` + `route`
   - `city`: `locality`
   - `state`: `administrative_area_level_1` (short name — 2-letter code)
   - `zip_code`: `postal_code`
3. Focus the `street_line_2` field automatically so the user can add apartment/unit if needed.
4. All parsed fields are still editable — don't lock them.

**Environment variable needed:**

```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=
```

> This key must have Google Places API enabled and should be restricted to your domain in Google Cloud Console.

---

### 2.4 Box Templates (Volumetric Packing Algorithm)

> **Note:** Actual box dimensions are approximate pending physical measurement. These templates will be updated once real boxes are purchased. The algorithm logic is final — only the dimension values need updating.

#### Box Catalog (templates):

```ts
const BOX_TEMPLATES = {
  envelope: {
    length: 12,
    width: 9,
    height: 1, // inches — standard bubble mailer
    maxWeightLb: 1,
    tareLb: 0.1,
    packageClass: "tiny", // fits: accessories, small tools
  },
  small: {
    length: 8,
    width: 6,
    height: 4, // inches — standard small box
    maxWeightLb: 10,
    tareLb: 0.3,
    fits: { tiny: 10, small: 3, medium: 1 },
  },
  medium: {
    length: 12,
    width: 9,
    height: 6, // inches
    maxWeightLb: 25,
    tareLb: 0.5,
    fits: { tiny: 20, small: 6, medium: 4, box_set: 2 },
  },
  large: {
    length: 18,
    width: 14,
    height: 12, // inches
    maxWeightLb: 50,
    tareLb: 1.0,
    fits: { tiny: 50, small: 15, medium: 8, box_set: 4 },
  },
  kit_large: {
    length: 24,
    width: 18,
    height: 14, // inches — professional kits only
    maxWeightLb: 80,
    tareLb: 1.5,
    fits: { kit_large: 1 },
  },
}
```

> When real boxes are measured, update ONLY the `length`, `width`, `height`, `maxWeightLb`, and `tareLb` values. The algorithm below stays the same.

---

### 2.5 Packing Algorithm

**Input:** Array of `{ packageClass, weightLb, quantity }` for all cart items.

**Output:** Array of box parcels to send to Shippo.

**Algorithm:**

```
1. Flatten items: expand by quantity
   → [{ packageClass: 'small', weightLb: 0.802 }, ...repeated 3 times]

2. Sort by packageClass descending (largest items first):
   kit_large > box_set > medium > small > tiny

3. Greedy bin packing:
   For each item:
     a. Find the smallest open box that can fit this item (has slot available in its 'fits' map)
     b. If found: add item to box, increment item count, add item weight
     c. If not found: open a new box of the correct size, add item to it

4. Fallback: if an item's packageClass > any single box can hold,
   flag it for manual review and block checkout with:
   "One or more items in your order require special handling.
    Please contact us to complete this purchase."

5. For each resulting box:
   totalWeightLb = sum of all items' weightLb + box tareLb
   → If any item has weight_lb = null: use category default weights:
     tiny: 0.2 lb, small: 0.8 lb, medium: 2.0 lb, box_set: 4.0 lb
   → Log a warning to the console (weight not found — update Square data)

6. Build Shippo parcel array:
   parcels = boxes.map(box => ({
     length: box.template.length.toString(),
     width: box.template.width.toString(),
     height: box.template.height.toString(),
     distance_unit: 'in',
     weight: box.totalWeightLb.toFixed(3),
     mass_unit: 'lb',
   }));
```

---

### 2.6 Shippo Rate Request

**Endpoint:** `POST /api/checkout/shipping-rates`

**Rate limit:** Max 5 requests per minute per IP (enforced by middleware).

```ts
const shipment = await shippo.shipment.create({
  address_from: {
    name: 'Metamorfosis Beauty Supply',
    street1: '---- Ontario CA address ----',  // replace with real address
    city: 'Ontario',
    state: 'CA',
    zip: '91761',
    country: 'US',
    phone: '909-XXX-XXXX',                   // replace with real phone
  },
  address_to: {
    name: customerFullName,
    street1: address.street_line_1,
    street2: address.street_line_2 ?? '',
    city: address.city,
    state: address.state,
    zip: address.zip_code,
    country: 'US',
    phone: address.phone_number,             // required field
  },
  parcels: [...],                            // from packing algorithm
  async: false,
});
```

**From the Shippo response, display these service levels:**

| Our label         | Shippo service match    | Estimated days    |
| ----------------- | ----------------------- | ----------------- |
| Standard Shipping | `usps_priority`         | 5–7 business days |
| Express Shipping  | `usps_express`          | 2–3 business days |
| Overnight         | `usps_overnight`        | Next business day |
| Pick Up in Store  | (no Shippo call needed) | N/A               |

**Free shipping logic:**

```ts
const subtotalCents = calculateSubtotal(cartItems); // after discounts
const isFreeShipping = subtotalCents >= parseInt(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS);

// Standard rate object in response:
{
  method: 'standard',
  label: 'Standard Shipping',
  description: 'Tracked via USPS · 5–7 business days',
  amount: isFreeShipping ? 0 : standardRateFromShippo,
  display: isFreeShipping ? 'FREE' : `$${standardRateFromShippo.toFixed(2)}`,
}
```

---

### 2.7 Return Labels

**Merchant fault** (`wrong_item`, `defective`, `damaged`):

- Admin generates a prepaid USPS return label from the case detail in the admin panel
- Calls Shippo's return shipment endpoint using the original `shippo_transaction_id` from the order
- Label URL stored in `cases.prepaid_label_url`
- Customer notified by email with the label attached

**Customer fault** (`no_longer_needed`, `ordered_by_mistake`):

- System generates a return label
- Cost fetched from Shippo → shown to customer for confirmation before generating
- Cost is stored and deducted from their refund amount
- Refund minus return shipping cost is processed via Square Payments API

---

## 3. Race Condition Prevention at Checkout

This is critical. Two users can simultaneously add the last unit of an item to their cart, both proceed to checkout, and both get to the payment screen at the same time. Without protection, both orders succeed and you oversell.

### 3.1 Pre-Payment Stock Lock

**Endpoint:** `POST /api/checkout/validate-payment`

Before charging the card, the server must:

```
1. Start a Supabase transaction (or use a Postgres advisory lock on the variations)
2. For each cart item:
   a. Fetch current inventory_count from product_variations WHERE id = variationId FOR UPDATE
      (the FOR UPDATE locks the row until the transaction completes)
   b. If inventory_count < quantity requested:
      → Abort transaction
      → Return 409 Conflict: {
          error: 'OUT_OF_STOCK',
          item: variation.name_en,
          available: inventory_count
        }
3. If all items pass:
   a. Charge card via Square Payments API
   b. On Square success:
      → Decrement inventory_count for each variation in Supabase
      → Create order + order_items records
      → Clear cart
   c. On Square failure:
      → Do NOT decrement inventory
      → Return payment error to client
```

**Client behavior on 409:**
Show an error state in the payment step:
_"Some items in your cart are no longer available in the requested quantity. Your cart has been updated."_
Then re-fetch the cart to reflect the current available stock.

### 3.2 Out-of-Stock Display Rules

| `inventory_count` | UI State                                  |
| ----------------- | ----------------------------------------- |
| > 4               | Normal — no badge                         |
| 1–4               | Orange "Only X left" badge                |
| 0                 | "Out of stock" badge, Add to Bag disabled |

**If a product goes out of stock while in someone's cart:**

- The cart displays the item with a warning: _"This item is now out of stock and cannot be purchased."_
- The item stays visible in the cart but is excluded from the checkout total
- A warning banner appears: _"Review your cart — some items are unavailable."_

### 3.3 Square as Inventory Authority

After a successful order, Square automatically decrements inventory (since we're using Square Payments + Catalog together). Our Supabase `inventory_count` gets updated on the next webhook sync. This means there's a small delay window. The `FOR UPDATE` lock approach above handles this at the DB level for concurrent web orders. The physical store terminal and the web share the same Square inventory, so overselling can still happen if a customer buys in-store at the exact moment an online order is processed — this is an edge case accepted by the business owner and does not require additional engineering.

---

## 4. Gemini Vision API — License Verification

### 4.1 Upload Flow

```
User uploads file → Supabase Storage (license-verification bucket, private)
  → path: {user_id}/license.{ext}
  → Server fetches file as buffer
  → Sends to Gemini Vision API
  → Processes response
  → Updates profile verification_status
```

### 4.2 API Call

```ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

const prompt = `
You are an automated document auditor for Metamorfosis Beauty Academy.
Analyze the uploaded license, student contract, or business tax certificate image.

Extract:
- Full Name
- License or Document Number
- Expiration or Graduation Date
- Document Type (license | student_contract | business_certificate)

Check for:
- Digital edits, cropping artifacts, or signs of tampering
- Blurriness or illegibility (if any field is unreadable, flag it)
- Invalid or unrecognized templates

Respond ONLY in valid JSON. No preamble, no markdown.
Schema:
{
  "isValid": boolean,
  "confidence": number (0.0 to 1.0),
  "documentType": "license" | "student_contract" | "business_certificate" | "unknown",
  "extractedData": {
    "fullName": string | null,
    "documentNumber": string | null,
    "expirationDate": "YYYY-MM-DD" | null
  },
  "flags": string[]
}
`
```

### 4.3 Decision Rules

| Condition                                       | Action                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confidence >= 0.85` AND `flags.length === 0`   | Auto-approve: set `verification_status = 'approved'`, update profile fields                                                                                         |
| `confidence >= 0.5 AND < 0.85` OR flags present | Set `verification_status = 'pending_review'` for manual admin review                                                                                                |
| `confidence < 0.5`                              | Auto-reject: set `verification_status = 'rejected'`, `rejection_reason = 'Document could not be verified automatically. Please re-upload a clear, unedited photo.'` |
| Gemini API error / timeout                      | Set `verification_status = 'pending_review'` (fail safe — never auto-reject on API error)                                                                           |

### 4.4 Rate Limit

**Endpoint:** `POST /api/profile/license/upload` — Max 3 uploads per hour per IP.

---

## 5. DeepL Translation — Catalog Sync

**Used for:** Translating `name_en` and `description_en` to Spanish on new or updated products.

**Only called when:** A product's name or description has changed (detected by comparing the incoming Square data with the Supabase record before upserting).

```ts
import * as deepl from "deepl-node"
const translator = new deepl.Translator(process.env.DEEPL_API_KEY)

const [nameResult, descResult] = await Promise.all([
  translator.translateText(nameEn, "en", "es"),
  translator.translateText(descriptionEn, "en", "es"),
])
```

**Caching:** After translation, the Spanish text is stored in Supabase. DeepL is NOT called on read — only on write during sync. This is critical to avoid burning API credits on every catalog request.

---

## 6. Leaflet Map — Order Tracking

### 6.1 Configuration

```ts
// Only import on client — Leaflet requires window
import dynamic from "next/dynamic"
const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
  ssr: false,
})
```

```ts
// TrackingMap.tsx
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

const ORIGIN = [34.0633, -117.6509]; // Ontario, CA
const destination = [lat, lng];       // from order's shipping_address (geocoded)

<MapContainer
  center={midpoint(ORIGIN, destination)}
  zoom={5}
  interactive={false}    // no zoom, no pan, no click — display only
  zoomControl={false}
  dragging={false}
  scrollWheelZoom={false}
  style={{ height: '200px', width: '100%' }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={ORIGIN} />           // origin pin
  <Marker position={destination} />      // destination pin
  <Polyline positions={[ORIGIN, destination]} color="#18181B" weight={2} dashArray="6" />
</MapContainer>
```

### 6.2 Geocoding the Delivery Address

To get lat/lng from the customer's address string for the map pin:
Use Google Geocoding API (same key as Places). Call once when the order is created (store result in `orders.shipping_address` jsonb as `{ ..., lat, lng }`).

```ts
// Add to the shipping_address jsonb snapshot at order creation time
const geocodeResult = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_API_KEY}`,
)
```

### 6.3 No Map for Guest Orders

Guest users receive the `tracking_url` (external carrier link) via email only. The Leaflet map is rendered exclusively in the authenticated `/profile/orders/[id]` page.

---

## 7. Email Provider — Resend (with AWS SES Migration Path)

### 7.1 Interface Pattern (Dependency Inversion)

```ts
// lib/email/EmailProvider.ts
export interface EmailProvider {
  send(
    to: string,
    subject: string,
    htmlContent: string,
    locale?: "en" | "es",
  ): Promise<void>
}

// lib/email/ResendEmailProvider.ts
export class ResendEmailProvider implements EmailProvider {
  async send(to, subject, htmlContent) {
    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    })
  }
}

// lib/email/index.ts — swap this one line to change provider
export const emailProvider: EmailProvider = new ResendEmailProvider()
```

To migrate to AWS SES later: create `AwsSesEmailProvider implements EmailProvider`, update the export. Zero changes to calling code.

### 7.2 Email Templates

All templates are React components rendered to HTML with `@react-email/components` (recommended) or simple template strings.

| Template key            | Trigger                   | Locale        |
| ----------------------- | ------------------------- | ------------- |
| `order-confirmed`       | Order placed              | User's locale |
| `order-shipped`         | Shippo label created      | User's locale |
| `order-delivered`       | Status → delivered        | User's locale |
| `order-canceled`        | Admin cancels             | User's locale |
| `case-opened`           | Case submitted            | User's locale |
| `case-updated`          | Case status changes       | User's locale |
| `case-closed`           | Case resolved             | User's locale |
| `verification-pending`  | Gemini: medium confidence | User's locale |
| `verification-approved` | Verification approved     | User's locale |
| `verification-rejected` | Verification rejected     | User's locale |
| `kit-confirmed`         | Kit purchase confirmed    | User's locale |

Password reset email is handled by **Supabase Auth** — do not implement this manually.

---

## 8. Pagination Strategy — Profile History Sections

To avoid saturating the user's profile with large history lists, all history sections use **cursor-based pagination with a "Load more" pattern**.

### 8.1 Order History (`/profile/orders`)

- Initial load: **last 5 orders** ordered by `created_at DESC`
- "Load more" button fetches next 5
- Closed cases and resolved verifications follow the same pattern

### 8.2 Cases (`/profile/orders/[id]` → case section)

- Show only the **last 3 cases** by default
- "View all cases" expands or paginates
- Closed/resolved cases are visually de-emphasized (gray, collapsed by default)
- Open/pending cases always appear at the top regardless of date

### 8.3 Supabase Query Pattern

```ts
// Initial load
const { data } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(5)

// Load more (pass the created_at of the last item as cursor)
const { data } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .lt("created_at", lastItemCursor)
  .limit(5)
```

---

## 9. Academy — Git Branch Strategy

> **For Cursor AI:** Before removing academy-related code, execute the following Git workflow:

```bash
# 1. Create and push the academy branch from current state
git checkout -b feature/academy
git add .
git commit -m "feat: preserve academy feature for future implementation"
git push origin feature/academy

# 2. Return to develop branch
git checkout develop

# 3. Remove all academy-related files and references:
#    - app/[locale]/academy/ routes
#    - components/academy/
#    - lib/academy.ts (if exists)
#    - academy_courses and academy_enrollments references in UI
#    - Any navigation links pointing to /academy
#    - Profile section "Academy Courses" → replace with coming-soon placeholder
#    - DO NOT remove the database tables (schema stays, they're harmless)
#    - DO NOT remove academy_enrollments from the SQL schema file

# 4. Commit the removal
git add .
git commit -m "chore: defer academy feature to future phase — preserved in feature/academy branch"
```

The database tables (`academy_courses`, `academy_enrollments`) stay in the schema. Removing them would cause migration issues later. They just won't be used in v1.

---

## 10. Security — Gaps Filled

### 10.1 CORS Policy

Configure in `next.config.ts`:

```ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
}
```

Only requests from `NEXT_PUBLIC_APP_URL` are accepted. This blocks cross-origin API abuse.

### 10.2 Signed URLs for Evidence Images

Same policy as license documents. Admin-facing case detail page generates signed URLs via:

```ts
const { data } = await supabase.storage
  .from("case-evidence")
  .createSignedUrls(evidenceImagePaths, 60) // 60 seconds
```

These are never stored — generated on-demand per admin request.

### 10.3 Admin Route Protection (Middleware)

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.includes("/admin")) {
    const session = getSessionFromRequest(request) // Supabase SSR session
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url))
    }
  }
}
```

No client-side admin logic. The admin bundle is not split from the main app but the routes are server-protected before rendering.

### 10.4 Cloudflare Turnstile

Protected endpoints:

- `POST /api/auth/signup`
- `POST /api/checkout/validate-payment`
- `POST /api/profile/license/upload`

Verification flow on server:

```ts
const response = await fetch(
  "https://challenges.cloudflare.com/turnstile/v2/siteverify",
  {
    method: "POST",
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: request.headers.get("x-forwarded-for"),
    }),
  },
)
const { success } = await response.json()
if (!success)
  return NextResponse.json({ error: "Bot detected" }, { status: 400 })
```

### 10.5 Input Validation (Zod)

Every API route validates its payload with Zod before any processing:

```ts
const CheckoutPaymentSchema = z.object({
  items: z
    .array(
      z.object({
        variationId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
  shippingMethod: z.enum(["standard", "express", "overnight", "pickup"]),
  addressId: z.string().uuid().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  termsAccepted: z.boolean(),
  turnstileToken: z.string().min(1),
  // If this field exists → abort. Price tamper detected.
  price: z.undefined(),
})
```

---

## 11. State Management Architecture

### 11.1 Zustand Stores

Organize into focused stores — not one massive store:

```
stores/
  useCartStore.ts         → cart items, totals, add/remove/update/clear
  useAuthStore.ts         → user session, profile, role
  useCheckoutStore.ts     → current checkout step, form state, selected shipping method
  useNotificationStore.ts → unread count, notification list, mark-as-read
  useWishlistStore.ts     → wishlist items (auth only)
```

### 11.2 Data Fetching

Use **TanStack Query** (`@tanstack/react-query`) for all server data:

- Product catalog queries
- Order history
- Case history
- Profile data

Use Zustand for **client-side state** (cart, checkout steps, UI state).

Do NOT mix: don't put server data in Zustand, don't put UI state in TanStack Query.

---

## 12. Recommended Libraries

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npm install framer-motion

# Forms
npm install react-hook-form @hookform/resolvers zod

# State
npm install zustand
npm install @tanstack/react-query

# i18n
npm install next-intl

# Maps
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Address autocomplete
npm install @react-google-maps/api

# File upload
npm install react-dropzone

# Security / sanitization
npm install isomorphic-dompurify
npm install -D @types/dompurify

# Email templates
npm install @react-email/components resend

# Date formatting
npm install date-fns

# Square integration (server-side only)
npm install squareup

# Shippo (server-side only)
npm install shippo

# Translation (server-side only)
npm install deepl-node

# Gemini Vision (server-side only)
npm install @google/generative-ai
```

---

## 13. Environment Variables (Complete)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=

# Shippo
SHIPPO_API_KEY=

# DeepL
DEEPL_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@metamorfosisbeauty.com
RESEND_FROM_NAME=Metamorfosis Beauty

# Gemini
GEMINI_API_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Google (Places + Geocoding)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=https://metamorfosisbeauty.com
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS=7000
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=4
NEXT_PUBLIC_SUPPORTED_LOCALES=en,es
NEXT_PUBLIC_DEFAULT_LOCALE=en

# OAuth → configured in Supabase Dashboard (no .env needed)
# Google Sign-In: Supabase → Auth → Providers → Google
# Apple Sign-In: Supabase → Auth → Providers → Apple
```

---

## 11. Square CDN Image Strategy

### 11.1 The approach

Square hosts all product images on its own CDN. That CDN supports **on-the-fly resizing via URL parameters** — no server processing, no Next.js image optimization costs.

```
https://items-images-production.s3.us-west-2.amazonaws.com/files/.../original.jpeg
→
https://items-images-production.s3.us-west-2.amazonaws.com/files/.../original.jpeg?width=600&fit=bounds
```

100% of resizing is delegated to Square's CDN. Zero server load.

### 11.2 The utility function

```ts
// lib/utils/square-image.ts

/**
 * Injects or replaces the `width` param on a Square CDN image URL.
 * Returns null if the URL is empty/null (caller renders <PlaceholderImage />).
 */
export function squareImageUrl(
  url: string | null | undefined,
  width: number,
): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    parsed.searchParams.set("width", String(width))
    parsed.searchParams.set("fit", "bounds")
    return parsed.toString()
  } catch {
    return url // not a valid URL — return as-is
  }
}
```

### 11.3 Width per context

| Context                       | Width  | Rationale                          |
| ----------------------------- | ------ | ---------------------------------- |
| Product card (catalog grid)   | `600`  | Fits 2-col mobile (300px × 2x DPR) |
| Product detail hero           | `1200` | Full-width on desktop, max quality |
| Cart line item thumbnail      | `200`  | Small thumbnail, no need for more  |
| Order confirmation thumbnail  | `160`  | Even smaller                       |
| Related products              | `400`  | Smaller grid cards                 |
| Color swatch (if image-based) | `80`   | Tiny circle swatch                 |

### 11.4 Usage in components

```tsx
import { squareImageUrl } from '@/lib/utils/square-image'

// Catalog card
<img
  src={squareImageUrl(product.image_url, 600) ?? '/placeholder.svg'}
  alt={product.name}
  loading="lazy"
  className="h-full w-full object-cover"
/>

// Product detail
<img
  src={squareImageUrl(product.image_url, 1200) ?? '/placeholder.svg'}
  alt={product.name}
  loading="lazy"
  className="h-full w-full object-cover"
/>
```

### 11.5 Next.js `<Image>` — only where it makes sense

Use Next.js `<Image>` component **only** for:

- Hero/banner images (homepage, about page, academy)
- OG images

**Hard limit: maximum 50 `<Image>` usages total across the app.** Beyond that you're paying for Vercel image optimization that Square's CDN already handles for free on product images.

For everything else — product cards, cart thumbnails, avatars, confirmation thumbnails — use plain `<img>` with `loading="lazy"`.

```tsx
// ✅ Next.js <Image> — hero/banner only
import Image from 'next/image'
<Image src="/home/hero-bg.jpg" alt="Hero" fill priority />

// ✅ Plain <img> — all product images, cards, avatars, thumbnails
<img src={squareImageUrl(url, 600)} alt={name} loading="lazy" />
```

### 11.6 Fallback chain with the utility

```tsx
// components/shared/product-image.tsx

import { squareImageUrl } from "@/lib/utils/square-image"

interface ProductImageProps {
  variationImageUrl?: string | null
  parentImageUrl?: string | null
  alt: string
  width: number
  className?: string
}

export function ProductImage({
  variationImageUrl,
  parentImageUrl,
  alt,
  width,
  className,
}: ProductImageProps) {
  const src =
    squareImageUrl(variationImageUrl, width) ??
    squareImageUrl(parentImageUrl, width)

  if (!src) return <PlaceholderImage alt={alt} className={className} />

  return <img src={src} alt={alt} loading="lazy" className={className} />
}

// components/shared/placeholder-image.tsx
export function PlaceholderImage({
  alt,
  className,
}: {
  alt: string
  className?: string
}) {
  return (
    <div
      className={`bg-bg-inset flex items-center justify-center ${className ?? ""}`}
    >
      <span className="text-fg-tertiary text-xs">No image</span>
    </div>
  )
}
```

### 11.7 Square environment — production for catalog

The app reads catalog from **production Square** (where the real inventory lives). Payment processing is guarded by `SQUARE_PAYMENTS_LIVE=false` in development — the checkout route returns a mock success without hitting Square Payments API. Set `SQUARE_PAYMENTS_LIVE=true` only when ready to take real money.

```ts
// api/checkout/submit/route.ts
if (process.env.SQUARE_PAYMENTS_LIVE !== "true") {
  // Dev mode: skip real payment, return mock order confirmation
  return NextResponse.json({
    orderId: `DEV-${Date.now()}`,
    status: "COMPLETED",
    _dev: true,
  })
}
// Production: call Square Payments API here
```
