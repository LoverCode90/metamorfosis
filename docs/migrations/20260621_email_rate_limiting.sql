-- Server-side per-email rate limiting for email-sending auth endpoints.
-- Run in Supabase Dashboard → SQL Editor.
--
-- Policy enforced in application code (lib/auth/email-rate-limit.ts):
--   • Max 3 sends per email per rolling hour
--   • Exceeding the allowance → 20-minute cooldown block
--   • After 2 blocks (6 total sends) → permanent ban in public.banned_emails
--
-- The shared banned_emails table (see 20260621_email_verification.sql) means an
-- email banned for verification-code abuse is also blocked from password reset.

-- ── Password-reset throttling: POST /api/auth/forgot-password ────────────────
create table if not exists public.password_reset_attempts (
  email         text primary key,
  attempt_count integer default 0 not null,
  block_count   integer default 0 not null,
  blocked_until timestamptz,
  window_start  timestamptz default now() not null
);

-- RLS on — only the service-role admin client touches this table.
alter table public.password_reset_attempts enable row level security;

-- ── Resend-code throttling: POST /api/auth/resend-code ──────────────────────
-- pending_signups already has resend_count + resend_window_start. Add a
-- dedicated block counter and cooldown timestamp so resend throttling never
-- collides with the wrong-code block_count / blocked_until columns consumed by
-- POST /api/auth/verify-email.
alter table public.pending_signups
  add column if not exists resend_block_count   integer default 0 not null,
  add column if not exists resend_blocked_until timestamptz;
