-- 20260624_zip_tax_cache.sql
-- ZIP-level tax rate cache. Populated lazily at checkout by getTaxRate().
-- Accessed only via the service-role client (admin); RLS blocks anon reads.

create table public.zip_tax_cache (
  zip        text primary key,
  state      text not null,
  rate       numeric(6,4) not null,
  source     text not null check (source in ('cdtfa', 'salestaxzip', 'fallback')),
  updated_at timestamptz default now() not null
);

alter table public.zip_tax_cache enable row level security;
-- No public policies — service role bypasses RLS; anon has no access.
