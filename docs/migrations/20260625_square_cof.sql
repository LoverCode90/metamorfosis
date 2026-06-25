-- ────────────────────────────────────────────────────────────
-- Migration: Add Square Customer & Card on File (COF) columns
-- ────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists square_customer_id text;
alter table public.profiles add column if not exists square_card_id text;

create index if not exists idx_profiles_square_customer on public.profiles(square_customer_id);
create index if not exists idx_profiles_square_card on public.profiles(square_card_id);
