-- Carrier pickup requests scheduled via Shippo (USPS / DHL Express).
create table if not exists public.carrier_pickups (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null check (slot_key in ('evening', 'daytime')),
  pickup_date date not null,
  requested_start_time timestamptz not null,
  requested_end_time timestamptz not null,
  confirmed_start_time timestamptz,
  confirmed_end_time timestamptz,
  status text not null,
  confirmation_code text,
  carrier_instructions text,
  carrier_account text,
  shippo_pickup_id text,
  transaction_ids text[] not null default '{}',
  order_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists carrier_pickups_pickup_date_idx
  on public.carrier_pickups (pickup_date desc);

comment on table public.carrier_pickups is
  'Admin-scheduled Shippo carrier pickups for labeled outbound orders.';
