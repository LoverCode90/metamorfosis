# Phase 5 — Cart + Checkout Setup

## Overview

Phase 5 upgrades the cart from a localStorage-only Zustand store to a Supabase-backed cart for authenticated users, and implements a full 3-step checkout flow (Info → Shipping → Payment) using the Square Web Payments SDK.

---

## Environment Variables

Add these to `.env.local` (never commit this file):

```bash
# Square — production credentials used for both catalog and payments
SQUARE_ACCESS_TOKEN=...           # Your production Square access token
SQUARE_LOCATION_ID=...            # Your production Square location ID
NEXT_PUBLIC_SQUARE_APPLICATION_ID=... # Square Application ID (public)
NEXT_PUBLIC_SQUARE_LOCATION_ID=...    # Square Location ID (public — same as above)

# Payment mode: "test" routes through Square sandbox SDK. No real charges.
# Set to "live" in production to accept real payments.
NEXT_PUBLIC_PAYMENT_MODE=test

# Free shipping threshold in cents (default: 7000 = $70.00)
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS=7000

# Cloudflare Turnstile — same keys used for signup and checkout
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

---

## Supabase Schema Requirements

The following tables must exist (see `docs/00_Schema.sql`):

### `carts`

```sql
create table carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
create unique index carts_user_id_idx on carts(user_id);
```

### `cart_items`

```sql
create table cart_items (
  id           uuid primary key default gen_random_uuid(),
  cart_id      uuid not null references carts(id) on delete cascade,
  variation_id uuid not null references product_variations(id),
  quantity     int not null check (quantity > 0),
  added_at     timestamptz default now(),
  unique (cart_id, variation_id)
);
```

### `orders`

```sql
create table orders (
  id                 uuid primary key default gen_random_uuid(),
  square_order_id    text,
  user_id            uuid references auth.users(id),
  guest_email        text,
  status             text not null default 'confirmed',
  shipping_method    text not null,
  subtotal_cents     int not null,
  discount_cents     int not null default 0,
  shipping_cents     int not null default 0,
  tax_cents          int not null default 0,
  total_cents        int not null,
  shipping_address   jsonb not null,
  terms_accepted     boolean not null default false,
  created_at         timestamptz default now()
);
```

### `order_items`

```sql
create table order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  variation_id     uuid not null references product_variations(id),
  quantity         int not null,
  unit_price_cents int not null,
  discount_cents   int not null default 0
);
```

### Inventory Lock RPC

Create a Postgres function for row-level inventory locking:

```sql
create or replace function check_and_lock_inventory(
  p_items jsonb
) returns jsonb
language plpgsql
security definer
as $$
declare
  rec record;
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_items) loop
    select *
    into rec
    from product_variations
    where id = (item->>'variation_id')::uuid
    for update nowait;

    if not found or not rec.is_active then
      return jsonb_build_object(
        'ok', false,
        'message', 'Item not available',
        'item', item->>'variation_id'
      );
    end if;

    if rec.inventory_count < (item->>'quantity')::int then
      return jsonb_build_object(
        'ok', false,
        'message', 'Insufficient stock',
        'item', rec.name_en,
        'available', rec.inventory_count
      );
    end if;
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;
```

---

## RLS Policies

```sql
-- carts: user can only see/modify their own cart
alter table carts enable row level security;
create policy "User owns cart" on carts
  for all using (auth.uid() = user_id);

-- cart_items: access through cart ownership
alter table cart_items enable row level security;
create policy "User owns cart items" on cart_items
  for all using (
    cart_id in (select id from carts where user_id = auth.uid())
  );

-- orders: user can view their own
alter table orders enable row level security;
create policy "User views own orders" on orders
  for select using (auth.uid() = user_id);
```

---

## Cart Flow

1. **Guest**: Items persisted in `localStorage` via Zustand `persist` middleware (`metamorfosis-cart` key).
2. **Login**: `useCart` hook calls `POST /api/cart/sync` once on auth state change, merging guest items into the Supabase cart (quantities are summed on conflict).
3. **Auth user**: Every `addToCart` / `increment` / `decrement` / `removeItem` makes a corresponding API call to keep the DB in sync.

---

## Checkout Flow

### Step 1 — Info (address form)

- React Hook Form + Zod validation
- Pre-fills from authenticated user's `profiles` row
- Non-returnable items show a terms acceptance checkbox (required)

### Step 2 — Shipping

- Calls `POST /api/checkout/shipping-rates` with current subtotal
- Phase 5: fixed rates (standard $7, express $15, overnight $25, pickup $0)
- Standard shipping is free when subtotal ≥ `FREE_SHIPPING_THRESHOLD_CENTS`
- Phase 6: replace with Shippo live rates

### Step 3 — Payment

- Loads Square Web Payments SDK from `sandbox.web.squarecdn.com` when `NEXT_PUBLIC_PAYMENT_MODE=test`
- Card tokenized client-side → `sourceId` nonce passed to the server
- Cloudflare Turnstile token required before submission

---

## Server-side Checkout Validation (`POST /api/checkout/validate-payment`)

Anti-tamper guarantees:

1. Any payload containing price fields (`price`, `total`, `subtotal`, etc.) is rejected with 400.
2. Variation prices fetched from Supabase (post-sync), never from the client.
3. Professional discount applied server-side based on verified `profiles.role` + `verification_status`.
4. Inventory locked via `check_and_lock_inventory` RPC (`SELECT ... FOR UPDATE NOWAIT`).
5. Card charged via Square Payments API.
6. Order + order_items inserted atomically.
7. Guest cart cleared server-side.

---

## Payment Mode

| `NEXT_PUBLIC_PAYMENT_MODE` | SDK URL                            | Real charges? |
| -------------------------- | ---------------------------------- | ------------- |
| `test`                     | `sandbox.web.squarecdn.com/v1/...` | No            |
| `live`                     | `web.squarecdn.com/v1/...`         | Yes           |

Test card: `4111 1111 1111 1111`, any future expiry + CVV.

---

## Wishlist Gate

Guests attempting to toggle the wishlist are shown a modal (`WishlistLoginModal`) prompting sign-in via OAuth or email. The wishlist is stored in Zustand `wishlist` store (localStorage persistence).

---

## What's Deferred to Phase 6

- Real Shippo shipping rates (replace fixed rates in `SHIPPING_RATES_CENTS`)
- Google Places Autocomplete for address autocomplete
- Order history page (`/profile/orders`)
- Email order confirmation (Resend / SendGrid)
