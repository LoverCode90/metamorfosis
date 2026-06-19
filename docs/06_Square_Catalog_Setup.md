# Square Catalog Setup

Runbook for connecting Square to Metamorfosis' Supabase catalog. Complete every step before firing the first sync.

---

## 1. Custom Attributes — Square Dashboard

Custom attributes must be created under **Items → Custom Attributes** in the Square Seller Dashboard **before** running any sync. The sync engine reads them by key name (case-insensitive).

### ITEM-level attributes

| Key                   | Type    | Values                                                |
| --------------------- | ------- | ----------------------------------------------------- |
| `is_professional`     | Boolean | `true` / `false`                                      |
| `is_returnable`       | Boolean | `true` / `false`                                      |
| `is_color_product`    | Boolean | `true` / `false`                                      |
| `package_class`       | String  | `tiny` / `small` / `medium` / `box_set` / `kit_large` |
| `color_family`        | String  | `naturals` / `warm` / `cool` / `pastel` / `special`   |
| `color_chart_pdf_url` | String  | full HTTPS URL to PDF                                 |

### ITEM_VARIATION-level attributes

| Key            | Type   | Values                   |
| -------------- | ------ | ------------------------ |
| `hex_color`    | String | CSS hex, e.g. `#A04020`  |
| `shade_number` | String | e.g. `7.4`, `5N`, `9B`   |
| `weight_lb`    | Number | decimal weight in pounds |

> **Important:** `is_returnable` must be stored as `true`/`false` (boolean text), not `Y`/`N`. The sync engine treats any non-`true` value as `false`.

---

## 2. Webhook Subscription

1. Open **Square Developer Dashboard → Webhooks**.
2. Create a new subscription with endpoint:
   ```
   https://{NEXT_PUBLIC_APP_URL}/api/webhooks/square
   ```
3. Subscribe to the event: **`catalog.version.updated`**
4. Copy the **Signature Key** that Square displays. Save it as:
   ```
   SQUARE_WEBHOOK_SIGNATURE_KEY=<key>
   ```
   in your hosting environment (Vercel / Railway / etc.).

> The webhook returns `200` immediately and runs the sync asynchronously. Square will not retry on 200.
> On bad signature it returns `403`; on malformed JSON it returns `400`.

---

## 3. Environment Variables

Add these to `.env.local` for local development and to your hosting provider for production. Update `.env.example` with placeholder values.

| Variable                          | Description                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `SQUARE_ACCESS_TOKEN`             | Production access token from Square Developer                                       |
| `SQUARE_WEBHOOK_SIGNATURE_KEY`    | From webhook subscription page                                                      |
| `SQUARE_LOCATION_ID`              | (optional) Filter inventory to a single location. Omit to sum all locations         |
| `DEEPL_API_KEY`                   | DeepL API key for EN→ES translation. Omit in dev — falls back to copying EN text    |
| `NEXT_PUBLIC_LOW_STOCK_THRESHOLD` | Integer. Variations at or below this count show the "Low stock" badge. Default: `4` |

---

## 4. Initial Data Population

Before products appear in the catalog, run a manual sync as an admin user:

```http
POST /api/admin/sync-catalog
Authorization: (session cookie as admin user)
```

Or via curl with a valid session:

```bash
curl -X POST https://{your-domain}/api/admin/sync-catalog \
  -H "Cookie: sb-access-token=<your-session-token>"
```

**Expected response:**

```json
{
  "ok": true,
  "stats": {
    "items": 142,
    "variations": 860,
    "deactivated": 0
  }
}
```

After a successful sync, navigate to `/products` — Square items appear instead of the 86 mock cards.

---

## 5. Sync Algorithm Summary

The sync runs on every `catalog.version.updated` webhook event and on manual admin triggers.

1. **Fetch** all `ITEM` and `ITEM_VARIATION` objects from Square catalog API (paginated).
2. **Fetch inventory counts** for all variation IDs filtered by `SQUARE_LOCATION_ID` (or all locations).
3. **Compare** `name_en` / `description_en` against existing Supabase rows.
4. **Translate** via DeepL only when English text has changed — never on pure read.
5. **Upsert** `product_translations` rows (conflict on `square_product_id`).
6. **Upsert** `product_variations` rows (conflict on `square_variation_id`).
7. **Soft-delete** any items Square has marked `is_deleted: true` — sets `is_active = false`, never hard-deletes.

Sync uses `createAdminClient()` (service role) so RLS doesn't block writes from the webhook context (no user session).

---

## 6. Local Development — Webhook Testing

Square can't reach `localhost` directly. Use a tunnel:

### Option A — ngrok

```bash
ngrok http 3000
# Outputs: https://abc123.ngrok-free.app
```

### Option B — Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
# Outputs: https://random-name.trycloudflare.com
```

Set the tunnel URL as your webhook endpoint in the Square Developer Dashboard for testing. Remember to add the new signature key to your `.env.local`.

To manually test the signature validator locally:

```bash
# 1. Grab the signature key from Square webhook subscription page
# 2. Use the Square Dashboard "Send test event" button
# 3. Check server logs for "[Square webhook]" lines
```

---

## 7. Color Products

Products with `is_color_product = true` show:

- A swatch selector on the detail page — one circle per variation where `hex_color` is set.
- Shade number label (e.g. `7.4`) on hover / selection.
- A disclaimer: _"Shades shown are a digital approximation. For accurate formulation, consult the printed chart or a licensed professional."_
- A download link when `color_chart_pdf_url` is set.

The catalog grid shows **one card per Square ITEM** (not per shade), with the first variation's price as "From $X.XX".

---

## 8. Soft-Delete Behavior

When a product is deactivated in Square (or deleted), the next sync sets `is_active = false` in `product_translations`. Active Supabase RLS policy already filters on `is_active = true` so it disappears from the catalog immediately.

Variations follow the same pattern via `product_variations.is_active`.

**Cart cleanup** for products that become inactive mid-session is deferred to Phase 5.

---

## 9. Checklist Before Go-Live

- [ ] All ITEM custom attributes created in Square Dashboard
- [ ] `is_returnable` values are `true`/`false` (not `Y`/`N`)
- [ ] `SQUARE_ACCESS_TOKEN` set in production environment
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY` set in production environment
- [ ] Webhook subscription pointing to production URL
- [ ] Initial sync run as admin → rows visible in Supabase
- [ ] `/products` page shows real catalog items
- [ ] Color product detail page shows hex swatches
- [ ] `DEEPL_API_KEY` set (or accepted fallback behavior for dev)
