-- Per-order pickup lifecycle + label metadata for Schedule Pickup admin UI.

alter table public.orders
  add column if not exists pickup_status text not null default 'unscheduled'
    check (pickup_status in ('unscheduled', 'scheduled', 'completed')),
  add column if not exists carrier_pickup_id uuid
    references public.carrier_pickups(id) on delete set null,
  add column if not exists label_purchased_at timestamptz,
  add column if not exists shipping_service text,
  add column if not exists label_cost_cents integer;

create index if not exists orders_pickup_status_idx
  on public.orders (pickup_status)
  where pickup_status != 'completed';

create index if not exists orders_carrier_pickup_id_idx
  on public.orders (carrier_pickup_id)
  where carrier_pickup_id is not null;

comment on column public.orders.pickup_status is
  'Pickup queue: unscheduled (ready), scheduled (awaiting carrier), completed (picked up).';
comment on column public.orders.label_cost_cents is
  'Actual Shippo label purchase cost in cents at print time.';
