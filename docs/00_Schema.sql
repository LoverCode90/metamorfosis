-- ============================================================
-- METAMORFOSIS LLC — Supabase PostgreSQL Schema
-- Copy and paste this entire file into:
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────

create type public.user_role as enum (
  'standard_customer',
  'student',
  'professional',
  'salon_owner',
  'admin'
);

create type public.pro_verification_status as enum (
  'not_applicable',
  'pending_review',
  'approved',
  'rejected'
);

create type public.package_class as enum (
  'tiny',       -- e.g. small accessories, single tools
  'small',      -- e.g. shampoos, conditioners, single color tubes
  'medium',     -- e.g. large bottles, multi-item orders
  'box_set',    -- e.g. bundles
  'kit_large'   -- professional kits (BBCos / Nutrapel)
);

create type public.case_status as enum (
  'open',
  'pending_review',   -- waiting on admin manual audit
  'approved',
  'rejected',
  'closed'
);

create type public.return_reason as enum (
  'damaged',
  'wrong_item',
  'defective',
  'not_as_described',
  'no_longer_needed',
  'ordered_by_mistake',
  'other'
);

create type public.notification_type as enum (
  'order_confirmed',
  'order_shipped',
  'order_delivered',
  'order_canceled',
  'case_opened',
  'case_updated',
  'case_closed',
  'verification_pending',
  'verification_approved',
  'verification_rejected',
  'kit_purchase_confirmed',
  'low_stock_alert'
);

create type public.shipping_method as enum (
  'standard',    -- USPS 5-7 business days
  'express',     -- 2-3 business days
  'overnight',   -- next business day
  'pickup'       -- in-store pickup at Ontario, CA
);

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'canceled',
  'refunded'
);


-- ────────────────────────────────────────────────────────────
-- 2. HELPER FUNCTION: updated_at automation
-- ────────────────────────────────────────────────────────────

create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ────────────────────────────────────────────────────────────
-- 3. TABLES
-- ────────────────────────────────────────────────────────────

-- 3.1 profiles
-- Created automatically when a user signs up via the trigger below.
create table public.profiles (
  id                    uuid references auth.users on delete cascade primary key,
  email                 text unique not null,
  full_name             text not null,
  phone_number          text,                       -- required for Shippo address validation
  bio                   text,                       -- short professional bio (optional)
  role                  public.user_role default 'standard_customer' not null,
  verification_status   public.pro_verification_status default 'not_applicable' not null,
  license_number        text,                       -- cosmetology / barber / esthetics license
  business_name         text,                       -- for salon_owner role
  school_name           text,                       -- for student role
  graduation_date       date,                       -- student expiration: auto-reverts role when reached
  document_url          text,                       -- Supabase Storage path (private bucket)
  expiration_date       date,                       -- license expiration date
  rejection_reason      text,                       -- written reason if admin rejects verification
  tax_exempt            boolean default false not null, -- true for approved salon_owners
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

create unique index idx_profiles_license_number
  on public.profiles(license_number)
  where license_number is not null;

create trigger update_profiles_modtime
  before update on public.profiles
  for each row execute procedure public.update_modified_column();


-- 3.2 Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3.3 product_translations (parent item — Square ITEM level)
create table public.product_translations (
  square_product_id       text primary key,           -- Square Catalog ITEM ID
  name_en                 text not null,
  description_en          text not null,
  name_es                 text not null,
  description_es          text not null,
  categories_hierarchy    text not null,              -- e.g. "Hair Care > Shampoos"
  is_professional         boolean default false not null,
  is_returnable           boolean default true not null,
  package_class           public.package_class default 'small' not null,
  is_color_product        boolean default false not null,
  color_family            text,                       -- 'naturals' | 'pastels' | 'warm' | 'cool' | 'special'
  color_chart_pdf_url     text,                       -- PDF for professional color reference
  details_keywords_en     text[] not null default '{}',
  details_keywords_es     text[] not null default '{}',
  recommended_skus        text[] not null default '{}', -- for "You may also like" section
  image_url               text,                       -- primary image (first of image_urls)
  image_urls              jsonb not null default '[]'::jsonb, -- all Square ITEM image CDN URLs
  is_active               boolean default true not null,
  updated_at              timestamptz default now() not null
);

create index idx_products_pro_status on public.product_translations(is_professional);
create index idx_products_color on public.product_translations(is_color_product);
create index idx_products_active on public.product_translations(is_active);

create trigger update_products_modtime
  before update on public.product_translations
  for each row execute procedure public.update_modified_column();


-- 3.4 product_variations (Square ITEM_VARIATION level)
-- Each variation = a unique SKU (size, shade/color, etc.)
create table public.product_variations (
  id                    uuid default gen_random_uuid() primary key,
  square_variation_id   text unique not null,         -- Square ITEM_VARIATION ID
  square_product_id     text references public.product_translations(square_product_id) on delete cascade not null,
  sku                   text unique,
  name_en               text not null,                -- e.g. "Shade 7N · Natural Blonde" or "1000ml"
  name_es               text not null,
  price_cents           integer not null,             -- stored in cents to avoid float issues
  weight_lb             numeric(6,3),                 -- real weighed value — required for Shippo packing
  inventory_count       integer default 0 not null,
  -- Color variation fields (null for non-color products)
  hex_color             text,                         -- e.g. "#C4956A"
  shade_number          text,                         -- e.g. "7N", "3R", "10NA"
  -- Size variation fields (null for color products)
  size_label            text,                         -- e.g. "60ml", "1000ml", "32oz"
  image_url             text,                         -- override parent image if variation has unique image
  is_active             boolean default true not null,
  updated_at            timestamptz default now() not null
);

create index idx_variations_product on public.product_variations(square_product_id);
create index idx_variations_sku on public.product_variations(sku);
create index idx_variations_inventory on public.product_variations(inventory_count);

create trigger update_variations_modtime
  before update on public.product_variations
  for each row execute procedure public.update_modified_column();


-- 3.5 addresses
create table public.addresses (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  label           text,                   -- e.g. "Home", "Studio", "Salon"
  full_name       text not null,
  phone_number    text not null,          -- required by Shippo
  street_line_1   text not null,
  street_line_2   text,
  city            text not null,
  state           text not null,          -- 2-letter US state code, e.g. "CA"
  zip_code        text not null,
  country         text default 'US' not null,  -- US-only, enforced at UI level
  is_default      boolean default false not null,
  created_at      timestamptz default now() not null
);

create index idx_addresses_user on public.addresses(user_id);

-- Enforce only one default address per user
create or replace function public.enforce_single_default_address()
returns trigger as $$
begin
  if new.is_default = true then
    update public.addresses
    set is_default = false
    where user_id = new.user_id
      and id != new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger ensure_single_default_address
  before insert or update on public.addresses
  for each row
  when (new.is_default = true)
  execute procedure public.enforce_single_default_address();


-- 3.6 carts (one active cart per authenticated user)
create table public.carts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade unique not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create trigger update_carts_modtime
  before update on public.carts
  for each row execute procedure public.update_modified_column();


-- 3.7 cart_items
-- Guest carts live in localStorage on the client.
-- This table is only for authenticated users.
create table public.cart_items (
  id            uuid default gen_random_uuid() primary key,
  cart_id       uuid references public.carts(id) on delete cascade not null,
  variation_id  uuid references public.product_variations(id) on delete cascade not null,
  quantity      integer not null check (quantity > 0),
  added_at      timestamptz default now() not null,
  unique(cart_id, variation_id)
);

create index idx_cart_items_cart on public.cart_items(cart_id);


-- 3.8 orders (local mirror of Square orders)
-- Created by the API route after Square confirms payment.
create table public.orders (
  id                    uuid default gen_random_uuid() primary key,
  square_order_id       text unique not null,
  user_id               uuid references public.profiles(id) on delete set null,
  guest_email           text,                         -- populated for guest checkouts
  status                public.order_status default 'pending' not null,
  shipping_method       public.shipping_method not null,
  -- Financials (all in cents)
  subtotal_cents        integer not null,
  discount_cents        integer default 0 not null,   -- professional/student $2 discount on colors
  shipping_cents        integer default 0 not null,   -- 0 if free shipping threshold met
  tax_cents             integer not null,
  total_cents           integer not null,
  -- Shipping snapshot (denormalized — address can change later)
  shipping_address      jsonb not null,
  -- Shippo tracking
  shippo_shipment_id    text,
  shippo_transaction_id text,                         -- also stored in cases for return labels
  tracking_number       text,
  carrier               text,                         -- e.g. "USPS", "UPS"
  tracking_url          text,                         -- external carrier URL (for guests)
  estimated_delivery_date date,
  delivered_at          timestamptz,
  -- Compliance
  terms_accepted        boolean default false not null, -- required when cart has chemical products
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_square on public.orders(square_order_id);

create trigger update_orders_modtime
  before update on public.orders
  for each row execute procedure public.update_modified_column();


-- 3.9 order_items
create table public.order_items (
  id                uuid default gen_random_uuid() primary key,
  order_id          uuid references public.orders(id) on delete cascade not null,
  variation_id      uuid references public.product_variations(id) on delete restrict not null,
  quantity          integer not null,
  unit_price_cents  integer not null,   -- price snapshot at time of purchase
  discount_cents    integer default 0 not null
);

create index idx_order_items_order on public.order_items(order_id);


-- 3.10 wishlists
-- Supports both product-level (no variation) and variation-level (specific shade/size).
create table public.wishlists (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  product_id    text references public.product_translations(square_product_id) on delete cascade not null,
  variation_id  uuid references public.product_variations(id) on delete cascade,  -- null for non-color products
  created_at    timestamptz default now() not null
);

-- Separate unique constraints to handle nullable variation_id correctly
create unique index idx_wishlist_no_variation
  on public.wishlists(user_id, product_id)
  where variation_id is null;

create unique index idx_wishlist_with_variation
  on public.wishlists(user_id, product_id, variation_id)
  where variation_id is not null;


-- 3.11 cases (support & returns)
create table public.cases (
  id                          uuid default gen_random_uuid() primary key,
  customer_id                 uuid references public.profiles(id) on delete cascade not null,
  order_id                    uuid references public.orders(id) on delete restrict not null,
  variation_id                uuid references public.product_variations(id) on delete restrict not null,
  reason                      public.return_reason not null,
  explanation                 text not null check (char_length(explanation) >= 100),
  evidence_images_urls        text[] not null default '{}',  -- 3-5 images, deleted on case close
  status                      public.case_status default 'open' not null,
  -- Shippo return logistics
  shippo_return_transaction_id  text,
  prepaid_label_url             text,   -- for merchant-fault returns (WRONG_ITEM, DEFECTIVE, DAMAGED)
  -- Admin fields
  admin_notes                 text,
  resolved_at                 timestamptz,
  created_at                  timestamptz default now() not null,
  updated_at                  timestamptz default now() not null
);

-- IMPORTANT: When status changes to 'closed', the API route must:
-- 1. Call Supabase Storage to delete all files in evidence_images_urls
-- 2. Then update the case status
-- This is handled in the application layer, not a DB trigger,
-- because triggers cannot call Supabase Storage API.

create index idx_cases_status on public.cases(status);
create index idx_cases_customer on public.cases(customer_id);

create trigger update_cases_modtime
  before update on public.cases
  for each row execute procedure public.update_modified_column();


-- 3.12 case_messages
create table public.case_messages (
  id          uuid default gen_random_uuid() primary key,
  case_id     uuid references public.cases(id) on delete cascade not null,
  sender_id   uuid references public.profiles(id) on delete set null,
  message     text not null,
  created_at  timestamptz default now() not null
);

create index idx_case_messages_case on public.case_messages(case_id);


-- 3.13 notifications (in-app)
create table public.notifications (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  type            public.notification_type not null,
  title_en        text not null,
  title_es        text not null,
  body_en         text not null,
  body_es         text not null,
  reference_id    text,     -- e.g. order UUID, case UUID
  reference_type  text,     -- 'order' | 'case' | 'verification' | 'kit'
  is_read         boolean default false not null,
  created_at      timestamptz default now() not null
);

create index idx_notifications_user_unread on public.notifications(user_id, is_read);


-- 3.14 professional_kits (the 2 available kits)
create table public.professional_kits (
  id                uuid default gen_random_uuid() primary key,
  square_product_id text unique not null,   -- kit as a product in Square
  name_en           text not null,
  name_es           text not null,
  description_en    text not null,
  description_es    text not null,
  brand             text not null,          -- 'BBCos' | 'Nutrapel'
  price_cents       integer not null,
  shipping_cents    integer not null,       -- customer always pays shipping for kits
  image_urls        text[] not null default '{}',
  is_active         boolean default true not null,
  created_at        timestamptz default now() not null
);


-- 3.15 kit_purchases (one-time per user per kit, enforced by unique constraint)
create table public.kit_purchases (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  kit_id          uuid references public.professional_kits(id) on delete restrict not null,
  square_order_id text unique not null,
  status          public.order_status default 'pending' not null,
  purchased_at    timestamptz default now() not null,
  unique(user_id, kit_id)   -- enforces lifetime one-time purchase per kit
);

create index idx_kit_purchases_user on public.kit_purchases(user_id);


-- 3.16 audit_logs (admin action history — required for legal disputes)
create table public.audit_logs (
  id              uuid default gen_random_uuid() primary key,
  admin_id        uuid references public.profiles(id) on delete set null not null,
  action          text not null,    -- e.g. 'verification_approved', 'case_status_changed', 'order_refunded'
  target_table    text not null,    -- e.g. 'profiles', 'cases', 'orders'
  target_id       text not null,    -- UUID of the affected row
  previous_value  jsonb,            -- snapshot before change
  new_value       jsonb,            -- snapshot after change
  notes           text,             -- optional admin comment
  created_at      timestamptz default now() not null
);

create index idx_audit_logs_admin on public.audit_logs(admin_id);
create index idx_audit_logs_target on public.audit_logs(target_table, target_id);
create index idx_audit_logs_date on public.audit_logs(created_at desc);


-- 3.17 discount_codes (Phase 2 — schema ready, feature disabled in v1)
create table public.discount_codes (
  id              uuid default gen_random_uuid() primary key,
  code            text unique not null,
  discount_cents  integer,                  -- fixed amount off
  discount_percent numeric(5,2),            -- percentage off (use one or the other)
  applies_to      text default 'all',       -- 'all' | 'color_products' | 'kits'
  min_order_cents integer default 0,
  uses_count      integer default 0 not null,
  max_uses        integer,                  -- null = unlimited
  valid_from      timestamptz default now() not null,
  valid_until     timestamptz,
  is_active       boolean default false not null,  -- default false until Phase 2
  created_at      timestamptz default now() not null
);


-- 3.18 academy_courses
create table public.academy_courses (
  id              uuid default gen_random_uuid() primary key,
  title_en        text not null,
  title_es        text not null,
  description_en  text not null,
  description_es  text not null,
  instructor      text not null,
  price_cents     integer not null,
  is_active       boolean default true not null,
  created_at      timestamptz default now() not null
);


-- 3.19 academy_enrollments
create table public.academy_enrollments (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  course_id     uuid references public.academy_courses(id) on delete restrict not null,
  enrolled_at   timestamptz default now() not null,
  completed_at  timestamptz,
  unique(user_id, course_id)
);


-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_variations enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.cases enable row level security;
alter table public.case_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.professional_kits enable row level security;
alter table public.kit_purchases enable row level security;
alter table public.audit_logs enable row level security;
alter table public.discount_codes enable row level security;
alter table public.academy_courses enable row level security;
alter table public.academy_enrollments enable row level security;


-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;


-- ── profiles ──
create policy "Users can view and update own profile"
  on public.profiles for all
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());


-- ── product_translations ──
create policy "Public can read catalog"
  on public.product_translations for select
  using (true);

create policy "Admins can manage catalog"
  on public.product_translations for all
  using (public.is_admin());


-- ── product_variations ──
create policy "Public can read variations"
  on public.product_variations for select
  using (true);

create policy "Admins can manage variations"
  on public.product_variations for all
  using (public.is_admin());


-- ── addresses ──
create policy "Users can manage own addresses"
  on public.addresses for all
  using (user_id = auth.uid());

create policy "Admins can read all addresses"
  on public.addresses for select
  using (public.is_admin());


-- ── carts ──
create policy "Users can manage own cart"
  on public.carts for all
  using (user_id = auth.uid());


-- ── cart_items ──
create policy "Users can manage own cart items"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      where id = cart_id and user_id = auth.uid()
    )
  );


-- ── orders ──
create policy "Users can read own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "Admins can read and update all orders"
  on public.orders for all
  using (public.is_admin());

-- Note: orders are created server-side via service_role in API routes.
-- No user insert policy needed here.


-- ── order_items ──
create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "Admins can read all order items"
  on public.order_items for select
  using (public.is_admin());


-- ── wishlists ──
create policy "Users can manage own wishlists"
  on public.wishlists for all
  using (user_id = auth.uid());


-- ── cases ──
create policy "Users can create and read own cases"
  on public.cases for all
  using (customer_id = auth.uid());

create policy "Admins can manage all cases"
  on public.cases for all
  using (public.is_admin());


-- ── case_messages ──
create policy "Users can participate in own case threads"
  on public.case_messages for all
  using (
    exists (
      select 1 from public.cases
      where id = case_id and customer_id = auth.uid()
    )
  );

create policy "Admins can participate in all case threads"
  on public.case_messages for all
  using (public.is_admin());


-- ── notifications ──
create policy "Users can read and mark own notifications"
  on public.notifications for all
  using (user_id = auth.uid());

-- Notifications are created by service_role in API routes (no user insert needed).


-- ── professional_kits ──
create policy "Public can read active kits"
  on public.professional_kits for select
  using (is_active = true);

create policy "Admins can manage kits"
  on public.professional_kits for all
  using (public.is_admin());


-- ── kit_purchases ──
create policy "Users can read own kit purchases"
  on public.kit_purchases for select
  using (user_id = auth.uid());

create policy "Admins can read all kit purchases"
  on public.kit_purchases for select
  using (public.is_admin());

-- Kit purchases created server-side via service_role.


-- ── audit_logs ──
create policy "Admins can read all audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- audit_logs only written by service_role in API routes.


-- ── discount_codes ──
-- No user access. Managed entirely via service_role or Supabase dashboard.
create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin());


-- ── academy_courses ──
create policy "Public can read active courses"
  on public.academy_courses for select
  using (is_active = true);

create policy "Admins can manage courses"
  on public.academy_courses for all
  using (public.is_admin());


-- ── academy_enrollments ──
create policy "Users can read own enrollments"
  on public.academy_enrollments for select
  using (user_id = auth.uid());

create policy "Admins can manage all enrollments"
  on public.academy_enrollments for all
  using (public.is_admin());


-- ────────────────────────────────────────────────────────────
-- 5. STORAGE BUCKETS
-- Create these manually in: Supabase Dashboard > Storage > New Bucket
-- ────────────────────────────────────────────────────────────

-- Bucket 1: license-verification
--   Visibility: PRIVATE
--   Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
--   Max file size: 10MB
--   Folder structure: {user_id}/license.{ext}
--   Access: user reads own files, admin reads all, signed URLs (60s) for admin portal

-- Bucket 2: case-evidence
--   Visibility: PRIVATE
--   Allowed MIME types: image/jpeg, image/png, image/webp
--   Max file size: 10MB per file (3-5 required per case)
--   Folder structure: {case_id}/{1..5}.{ext}
--   Access: user reads own files, admin reads all, signed URLs (60s)
--   Lifecycle: files deleted by API route when case status → 'closed'

-- Bucket 3: product-images
--   Visibility: PUBLIC
--   Purpose: synced from Square via webhook
--   Folder structure: {square_product_id}/{variation_id}.{ext}

-- Bucket 4: kit-assets
--   Visibility: PUBLIC
--   Purpose: kit marketing images, color chart PDFs
--   Folder structure: {kit_id}/{asset_name}.{ext}


-- ────────────────────────────────────────────────────────────
-- 6. ADMIN ACCOUNT SETUP
-- Run this AFTER the owner and developer sign up normally via the app.
-- Replace the emails below with real ones.
-- ────────────────────────────────────────────────────────────

-- update public.profiles
-- set role = 'admin'
-- where email in (
--   'developer@yourdomain.com',
--   'owner@yourdomain.com'
-- );

-- ────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ────────────────────────────────────────────────────────────
