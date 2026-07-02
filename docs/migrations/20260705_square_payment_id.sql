-- Store Square payment ID separately from square_order_id so refunds use
-- refundPayment({ paymentId }) even when no Square Order was created.
alter table public.orders
  add column if not exists square_payment_id text;

create index if not exists idx_orders_square_payment
  on public.orders (square_payment_id)
  where square_payment_id is not null;
