-- In-store pickup deadline + fulfillment timestamps on orders.
-- Run in Supabase SQL editor before deploying pickup auto-cancel cron.

alter table public.orders
  add column if not exists pickup_deadline_at timestamptz,
  add column if not exists picked_up_at timestamptz;

-- Backfill deadline for existing pickup orders (5 calendar days from created_at).
update public.orders
set pickup_deadline_at = created_at + interval '5 days'
where carrier = 'pickup'
  and pickup_deadline_at is null;

create index if not exists orders_pickup_deadline_idx
  on public.orders (carrier, status, pickup_deadline_at)
  where carrier = 'pickup';
