# Inventory Sync & Operations Correctness — Implementation Plan

**Status:** Draft for owner review — no code changes until approved.

**Goal:** Make Square the authoritative inventory source for both online and in-store POS, fix confirmed operational bugs, and close dead-end admin workflows — without adding new admin surface area (no CRM, no inventory browser, no RBAC).

**Out of scope:** RBAC/sub-roles, customer CRM, discount codes UI, audit log viewer, catalog browser admin page, academy courses.

---

## Priority overview

| P      | Area                                       | Why first                                               |
| ------ | ------------------------------------------ | ------------------------------------------------------- |
| **P0** | Two-way Square ↔ Supabase inventory        | Overselling risk on both channels today                 |
| **P1** | Cancellation inventory restore (all paths) | Stock silently wrong after refunds                      |
| **P1** | Shipped/delivered customer emails          | Customers never notified on shipment                    |
| **P1** | Case approve → refund/return-label UI      | Approved cases are a dead end                           |
| **P2** | Shippo order status without carrier pickup | Orders stuck at "Label printed" forever                 |
| **P2** | Store pickup delivered email               | No notification when bag is handed off                  |
| **P2** | Square refund ID reliability               | Refunds can fail when `square_order_id` is a payment ID |
| **P3** | Minor consistency / dead code              | Low day-to-day impact                                   |

---

## P0 — Real-time two-way inventory sync (Square ↔ Supabase)

### P0.1 What's wrong

1. **Square → Supabase (POS / manual adjustments):**  
   [`app/api/webhooks/square/route.ts`](../app/api/webhooks/square/route.ts) handles only `catalog.version.updated` (lines 36–41). A physical POS sale changes inventory without necessarily changing the catalog, so Supabase `product_variations.inventory_count` stays stale until someone clicks **Update products from Square** ([`app/api/admin/sync-catalog/route.ts`](../app/api/admin/sync-catalog/route.ts) → [`lib/square/sync.ts`](../lib/square/sync.ts) `batchGetCounts`).

2. **Supabase → Square (online sales):**  
   [`lib/checkout/persist-order.ts`](../lib/checkout/persist-order.ts) lines 109–118 decrement `inventory_count` in Supabase only. Square Inventory is never updated, so the physical POS still shows pre-online-sale stock.

**Impact:** Online store and physical POS can each sell units the other channel still believes are available → overselling, angry customers, manual reconciliation.

### P0.2 Fix approach — Square → Supabase

1. **Square Developer Dashboard:** Subscribe the production webhook to `inventory.count.updated` (keep existing `catalog.version.updated`).

2. **Extend webhook handler** [`app/api/webhooks/square/route.ts`](../app/api/webhooks/square/route.ts):
   - After signature validation, branch on `event.type`.
   - For `inventory.count.updated`, parse payload (`data.object.inventory_counts[]` — catalog object ID + quantity + state + location).
   - Map `catalog_object_id` → `product_variations.square_variation_id` (single-row update by Square variation ID).
   - Update `inventory_count` for `state === IN_STOCK` at `SQUARE_LOCATION_ID` (same aggregation logic as [`lib/square/sync.ts`](../lib/square/sync.ts) lines 57–71).
   - Return 200 immediately; process async if needed (same pattern as catalog sync).
   - Ignore unknown variation IDs (log warning).

3. **New module** `lib/square/inventory-webhook.ts` (or `lib/square/inventory-sync.ts`):
   - `applySquareInventoryCounts(counts: SquareInventoryCount[]): Promise<void>`
   - Shared with full sync to avoid divergent count logic.

4. **Idempotency:** Webhooks may retry; upsert absolute count from Square (not delta), so retries are safe.

**Files touched:**

- `app/api/webhooks/square/route.ts`
- `lib/square/inventory-sync.ts` (new)
- Optionally refactor count aggregation out of `lib/square/sync.ts`

### P0.3 Fix approach — Supabase → Square (online checkout)

1. **New module** `lib/square/inventory-adjust.ts`:
   - `decrementSquareInventory(items: { squareVariationId: string; quantity: number }[], idempotencyKey: string): Promise<void>`
   - Uses Square Inventory API `batchChangeInventory` with `ADJUSTMENT` type, negative quantity, `locationId` from `SQUARE_LOCATION_ID`, `occurredAt` now.
   - One batch per checkout (all line items).
   - On `INSUFFICIENT_STOCK` or equivalent API error → throw typed error.

2. **Checkout flow change** in [`app/api/checkout/validate-payment/route.ts`](../app/api/checkout/validate-payment/route.ts):
   - **After** successful `chargeCard()` (line 109–118), **before** `persistOrder()`:
     - Call `decrementSquareInventory` using `varMap` → `square_variation_id` per item.
     - Use idempotency key derived from `chargeResult.paymentId` (safe retry).
   - **If Square inventory decrement fails after charge:** Critical path — log + alert; options (pick one in implementation):
     - **(Recommended)** Attempt automatic Square refund of payment, return 409 to customer with out-of-stock message; do not call `persistOrder`.
     - Document manual reconciliation playbook if refund also fails.

3. **Supabase decrement in** [`lib/checkout/persist-order.ts`](../lib/checkout/persist-order.ts):
   - **Option A (recommended):** Remove local decrement; rely on `inventory.count.updated` webhook to refresh Supabase within seconds.
   - **Option B:** Keep local decrement as optimistic cache + webhook reconciles authoritative value.
   - If Option A, add short comment that Supabase count is webhook-driven post-checkout.

**Files touched:**

- `lib/square/inventory-adjust.ts` (new)
- `app/api/checkout/validate-payment/route.ts`
- `lib/checkout/persist-order.ts`
- `lib/checkout/validate-payload.ts` (already has `square_variation_id` — no schema change)

### P0.4 Race condition: last unit, online vs POS

**Current behavior:**

| Step              | What happens                                                                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lockInventory()` | RPC `check_and_lock_inventory` — `SELECT … FOR UPDATE NOWAIT` on `product_variations` rows, checks `inventory_count >= qty`, returns. **Lock is released when the RPC transaction ends** — not held through payment. |
| `chargeCard()`    | Seconds later; no lock held.                                                                                                                                                                                         |
| `persistOrder()`  | Decrements Supabase using **stale** `varMap.inventory_count` from start of request (line 115).                                                                                                                       |

**With P0 implemented:**

- **Authoritative gate moves to Square** at decrement time (post-payment). Square rejects the adjustment if POS already sold the last unit.
- Supabase RPC lock is still useful to reduce **double online checkout** collisions (two tabs same customer) but is **not sufficient** for cross-channel races.
- **Recommended hardening (include in P0):**
  1. Before charge, optionally re-fetch Square inventory via `batchGetCounts` for cart variation IDs; reject checkout if insufficient (display-only; not a lock).
  2. Post-payment Square `batchChangeInventory` is the real commit.
  3. Webhook updates Supabase; optional optimistic decrement in `persistOrder` if keeping Option B.
  4. Document residual window: between pre-charge read and post-charge adjustment, POS could sell last unit → charge succeeds, Square adjustment fails → refund path (P0.3).

**`check_and_lock_inventory`:** Keep for online-vs-online contention; document that it does not lock across payment or POS. Consider renaming comment in [`lib/checkout/lock-inventory.ts`](../lib/checkout/lock-inventory.ts) to avoid implying a held reservation.

**Files touched:**

- `lib/checkout/lock-inventory.ts` (comments only, unless RPC extended)
- `app/api/checkout/validate-payment/route.ts` (pre-charge Square read + post-charge adjustment)
- `docs/` — short ops note on race behavior

### P0.5 Inventory restore on cancel/refund (both systems)

Introduce shared helper used by all cancel/refund paths:

**New** `lib/inventory/restore-order-inventory.ts`:

```text
restoreOrderInventory(admin, orderId, idempotencyKey, direction: 'increment')
  → load order_items + product_variations.square_variation_id
  → increment product_variations.inventory_count (Supabase)
  → call Square batchChangeInventory (+quantity) per item
```

Call sites (P1 details below):

- `lib/orders/cancel-pickup-order.ts` (replace inline Supabase-only loop)
- `app/api/admin/orders/[id]/cancel/route.ts`
- `app/api/orders/[id]/cancel/route.ts` (customer cancel)
- `app/api/cron/expire-pickup-orders/route.ts` (via `cancelPickupOrder`)
- `app/api/admin/cases/[id]/refund/route.ts` (optional: restore if return not expected — **business rule:** usually no restore until item received; document default = no restore on refund-only)

**Default policy for case refunds:** Do **not** auto-restore inventory on refund (customer may not return goods). Owner can restock manually in Square. Plan notes this; only order **cancellations** restore stock.

---

## P1 — Confirmed bugs (same priority band)

### P1.1 Shipped/delivered emails never send

**What's wrong:** [`lib/orders/status-side-effects.ts`](../lib/orders/status-side-effects.ts) `runOrderStatusSideEffects()` sends `sendOrderShipped` / `sendOrderDelivered` but is **never imported or called**. [`app/api/webhooks/shippo/route.ts`](../app/api/webhooks/shippo/route.ts) `handleTrackUpdated` (lines 52–114) updates DB only.

**Impact:** Customers never receive shipped or delivered emails after carrier events.

**Fix:**

- In `handleTrackUpdated`, after successful `orders.update`, if `statusUpdate.status === 'shipped'` or `'delivered'`, call `runOrderStatusSideEffects(admin, order.id, newStatus)` (fire-and-forget with existing try/catch inside helper).
- Pass `order.id` (already fetched line 69–73); extend select if helper needs more fields later.

**Files:** `app/api/webhooks/shippo/route.ts`, possibly extend select in `handleTrackUpdated`.

---

### P1.2 Mail order cancel doesn't restore inventory

**What's wrong:** [`app/api/admin/orders/[id]/cancel/route.ts`](../app/api/admin/orders/[id]/cancel/route.ts) refunds (lines 57–60) and sets `status: canceled` (62–65) but never restores `product_variations.inventory_count`. Compare [`lib/orders/cancel-pickup-order.ts`](../lib/orders/cancel-pickup-order.ts) lines 60–75 (Supabase restore only).

**Impact:** Canceled mail orders leave Supabase stock too low; after P0, Square stock also too low until manual sync.

**Fix:**

- Extend order `select` to include `order_items(variation_id, quantity)`.
- After successful refund + status update, call `restoreOrderInventory()` from P0.5.
- Same change for **customer** cancel [`app/api/orders/[id]/cancel/route.ts`](../app/api/orders/[id]/cancel/route.ts) — same missing restore (lines 57–70).

**Files:** Both cancel routes, `lib/inventory/restore-order-inventory.ts`.

---

### P1.3 Pickup cancel / cron expire — add Square restore

**What's wrong:** [`lib/orders/cancel-pickup-order.ts`](../lib/orders/cancel-pickup-order.ts) restores Supabase only.

**Impact:** After P0 online decrements Square, pickup cancels leave Square count wrong → POS shows less stock than reality.

**Fix:** Replace inline loop with `restoreOrderInventory()` (P0.5).

**Files:** `lib/orders/cancel-pickup-order.ts`.

---

### P1.4 Case approve is a dead end — wire refund & return-label UI

**What's wrong:**

- [`components/admin/cases/case-actions.tsx`](../components/admin/cases/case-actions.tsx) line 17: `RESOLVED_STATUSES` includes `"approved"`, so after approve the UI shows "This case is finished" (lines 30–35) with **no further buttons**.
- Server routes exist and work:
  - `POST /api/admin/cases/[id]/refund` — Square refund, case `closed`, order `refunded`
  - `POST /api/admin/cases/[id]/return-label` — prepaid return label (store-fault reasons)
- Approve route [`app/api/admin/cases/[id]/approve/route.ts`](../app/api/admin/cases/[id]/approve/route.ts) only sets `status: approved` + email — does not issue label or refund.

**Impact:** Owner approves a return, customer gets approval email, but owner cannot complete refund or send return label from the admin UI. Workflow stops.

**Fix:**

1. **Split UI states** in `case-actions.tsx`:
   - `open` / `pending_review` → existing Approve / Reject / Request info.
   - `approved` → new action panel:
     - **"Generate return label"** (if store-fault reason per `STORE_FAULT_REASONS` in [`lib/constants.ts`](../lib/constants.ts) and order has `shippo_transaction_id`) → `POST .../return-label`
     - **"Issue refund"** → confirm dialog (irreversible) → `POST .../refund`
     - Show clear copy: approve = accept case; refund = money back; label = optional first for mail returns.
   - `closed` / `rejected` / `fraud` → finished message (keep).

2. **New hook methods** in [`hooks/use-case-actions.ts`](../hooks/use-case-actions.ts): `issueRefund()`, `generateReturnLabel()`.

3. **Confirm dialog** for refund (reuse [`CaseResolutionDialog`](../components/admin/cases/case-resolution-dialog.tsx) pattern) — warn Square refund is irreversible.

4. **Return-label failure UX:** Surface API errors (e.g. no `shippo_transaction_id` for store-pickup orders — see P2.3).

**Files:**

- `components/admin/cases/case-actions.tsx`
- `hooks/use-case-actions.ts`
- Optional: `components/admin/cases/case-approved-actions.tsx` (new, if file grows)

---

## P2 — Additional confirmed issues (full codebase scan)

### P2.1 Mail orders may never reach `shipped` if carrier pickup not scheduled

**What's wrong:** [`app/api/webhooks/shippo/route.ts`](../app/api/webhooks/shippo/route.ts) lines 87–88: `shouldMarkShipped` requires `carrierStatus === 'TRANSIT'` **and** `order.pickup_status === 'scheduled'`. If the owner drops packages at USPS without using **Carrier pickup** ([`/admin/shipping/pickups`](<../app/(admin)/admin/shipping/pickups/page.tsx>)), `pickup_status` stays `unscheduled` → order stuck at `confirmed` ("Label printed") even while carrier is in transit.

**Impact:** Wrong status in admin and customer profile; shipped email (after P1.1) would not fire.

**Fix options (pick one):**

- **A:** `shouldMarkShipped = carrierStatus === 'TRANSIT'` regardless of `pickup_status` (simplest).
- **B:** Also set `shipped` on first `TRANSIT` when `pickup_status` is `unscheduled` OR `scheduled`.

**Files:** `app/api/webhooks/shippo/route.ts`

---

### P2.2 Store pickup "delivered" — no customer email

**What's wrong:** [`app/api/admin/orders/[id]/mark-picked-up/route.ts`](../app/api/admin/orders/[id]/mark-picked-up/route.ts) sets `status: delivered` (lines 63–66) but never calls `sendOrderDelivered` or `runOrderStatusSideEffects`.

**Impact:** Customer is not emailed when they collect their bag (unlike mail delivery).

**Fix:** After update, call `runOrderStatusSideEffects(admin, orderId, 'delivered')` (or direct `sendOrderDelivered`).

**Files:** `app/api/admin/orders/[id]/mark-picked-up/route.ts`

---

### P2.3 Return label API unusable for store-pickup orders

**What's wrong:** [`app/api/admin/cases/[id]/return-label/route.ts`](../app/api/admin/cases/[id]/return-label/route.ts) lines 36–41 require `orders.shippo_transaction_id`. Store pickup orders never get a Shippo label → API always 400.

**Impact:** Even with P1.4 UI, owner cannot generate prepaid return labels for cases tied to in-store pickup orders (must handle manually).

**Fix (minimal):** In approved-case UI, hide/disable "Generate return label" when `!order.shippo_transaction_id`; show helper text ("Mail-ship orders only — create label manually in Shippo for pickup orders"). No new shipping integration in this plan.

**Files:** `components/admin/cases/case-actions.tsx` (conditional), case detail query may need `orders.shippo_transaction_id`.

---

### P2.4 Square refund may fail when `square_order_id` stores a Payment ID

**What's wrong:** [`app/api/checkout/validate-payment/route.ts`](../app/api/checkout/validate-payment/route.ts) line 123: `squareOrderId: chargeResult.squareOrderId || chargeResult.paymentId`. [`lib/square/payments.ts`](../lib/square/payments.ts) `chargeCard` does not create a Square Order — `payment.orderId` is often empty. [`lib/square/refund.ts`](../lib/square/refund.ts) line 14 calls `squareClient.orders.get({ orderId: squareOrderId })` — fails if value is a Payment ID.

**Impact:** Admin/customer cancel and pickup cancel refunds throw "Order not found in Square" for affected orders.

**Fix:**

- Prefer refund-by-payment: `refundPayment({ paymentId })` using stored payment ID.
- Store both `square_payment_id` and `square_order_id` on `orders` (migration), or encode payment ID in existing column with clear naming.
- Backfill: payment ID from Square if only payment id stored.

**Files:** `lib/square/refund.ts`, `lib/checkout/persist-order.ts`, new migration for `square_payment_id` column (recommended), all cancel/refund callers.

---

### P2.5 `order_status.processing` never written

**What's wrong:** Enum includes `processing` ([`docs/00_Schema.sql`](../docs/00_Schema.sql) lines 75–83). Referenced in [`lib/orders/expire-pickup-orders.ts`](../lib/orders/expire-pickup-orders.ts) line 23 and [`lib/admin/dashboard-stats.ts`](../lib/admin/dashboard-stats.ts) but no route sets `status: 'processing'`.

**Impact:** None today — dead enum value; filters/labels misleading if someone expects "Preparing" orders.

**Fix:** Remove from expire/dashboard queries OR document as unused; no new workflow unless owner wants a "packing" step later. **Defer implementation** unless owner wants cleanup in same pass.

---

### P2.6 Fraud case API has no UI entry point

**What's wrong:** [`app/api/admin/cases/[id]/fraud/route.ts`](../app/api/admin/cases/[id]/fraud/route.ts) exists; no button in `case-actions.tsx`. Cases list filter ([`app/(admin)/admin/cases/page.tsx`](<../app/(admin)/admin/cases/page.tsx>) lines 25–31) has no `fraud` tab.

**Impact:** Owner cannot mark photo/condition mismatch fraud from UI (must use API/DB directly).

**Fix (minimal):** Add "Mark as fraud" to open-case actions (destructive, confirm dialog) → existing fraud route. Add `fraud` to case list filters.

**Files:** `case-actions.tsx`, `cases/page.tsx`, `use-case-actions.ts`

---

### P2.7 Customer cancel writes `audit_logs.admin_id` as customer user id

**What's wrong:** [`app/api/orders/[id]/cancel/route.ts`](../app/api/orders/[id]/cancel/route.ts) line 76: `admin_id: user.id` on customer self-cancel (column is NOT NULL FK to profiles in schema).

**Impact:** Works if customer is a profile row; semantically wrong in audit trail (shows customer as admin). Low operational impact.

**Fix:** Use nullable `admin_id` + new `actor_id` or `action: customer_cancel_order` with `admin_id: null` if schema allows — check [`docs/00_Schema.sql`](../docs/00_Schema.sql) `audit_logs.admin_id ... not null`. May require migration to nullable or system user. **Defer** unless auditing matters.

---

## P3 — Deferred / document only

| Item                                                 | Note                                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Manual order status API disabled                     | [`app/api/admin/orders/[id]/status/route.ts`](../app/api/admin/orders/[id]/status/route.ts) returns 403 — intentional |
| `handleTransactionCreated` duplicate webhook         | May re-apply `confirmed`; low risk                                                                                    |
| Full catalog sync on every `catalog.version.updated` | Heavy but acceptable for solo store; inventory webhook reduces urgency                                                |

---

## Suggested implementation order

1. **P0.5** shared `restoreOrderInventory` + Square adjust module (foundation)
2. **P0.2** inventory webhook handler
3. **P0.3** checkout Square decrement + failure/refund path
4. **P1.2 + P1.3** wire restore into all cancel paths
5. **P1.1** Shippo email side effects
6. **P1.4** case approved actions UI
7. **P2.1, P2.2, P2.4** status + email + refund ID fixes
8. **P2.6** fraud button (optional same PR as P1.4)

---

## Square Dashboard checklist (owner manual steps)

- [ ] Add `inventory.count.updated` to production webhook subscription URL
- [ ] Confirm webhook signature key matches `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] Confirm Inventory API permissions on production access token
- [ ] After deploy: test POS sale → verify Supabase count updates within ~1 minute without manual sync

---

## Testing plan (per phase)

| Test                            | Expected                                                            |
| ------------------------------- | ------------------------------------------------------------------- |
| POS sells 1 unit                | Supabase `inventory_count` drops via webhook                        |
| Online buys 1 unit              | Square inventory drops; webhook syncs Supabase                      |
| Last unit race                  | Second channel gets clear failure (Square adjust or checkout error) |
| Admin cancel pending mail order | Stock restored in Square + Supabase                                 |
| Pickup cancel / cron expire     | Stock restored in both                                              |
| Shippo TRANSIT webhook          | Order → shipped + customer email                                    |
| Shippo DELIVERED webhook        | Order → delivered + customer email                                  |
| Approve case → refund           | UI completes; order refunded                                        |
| Approve case → return label     | Label URL stored; customer emailed (mail orders)                    |

---

## Files index (new + modified)

| File                                                | Role                                     |
| --------------------------------------------------- | ---------------------------------------- |
| `lib/square/inventory-sync.ts`                      | **New** — apply counts from webhook/sync |
| `lib/square/inventory-adjust.ts`                    | **New** — batchChangeInventory +/-       |
| `lib/inventory/restore-order-inventory.ts`          | **New** — dual restore                   |
| `app/api/webhooks/square/route.ts`                  | inventory.count.updated handler          |
| `app/api/checkout/validate-payment/route.ts`        | Square decrement + failure handling      |
| `lib/checkout/persist-order.ts`                     | Decrement strategy (webhook vs local)    |
| `lib/orders/cancel-pickup-order.ts`                 | Use shared restore                       |
| `app/api/admin/orders/[id]/cancel/route.ts`         | Restore + order_items select             |
| `app/api/orders/[id]/cancel/route.ts`               | Restore + order_items select             |
| `app/api/webhooks/shippo/route.ts`                  | Email side effects; shipped rule         |
| `app/api/admin/orders/[id]/mark-picked-up/route.ts` | Delivered email                          |
| `components/admin/cases/case-actions.tsx`           | Approved-state actions                   |
| `hooks/use-case-actions.ts`                         | refund + return-label                    |
| `lib/square/refund.ts`                              | Payment-based refund                     |
| `docs/migrations/YYYYMMDD_square_payment_id.sql`    | **New** — optional payment ID column     |

---

_Review this plan and specify which priorities to implement first._
