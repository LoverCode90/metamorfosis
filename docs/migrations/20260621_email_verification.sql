-- Email verification flow: pending_signups + banned_emails
-- Run in Supabase Dashboard → SQL Editor

-- Stores pre-verified signup attempts before an auth.users row is created.
create table if not exists public.pending_signups (
  id                  uuid default gen_random_uuid() primary key,
  email               text not null unique,
  full_name           text not null,
  code_hash           text not null,         -- SHA-256 hex of the 4-digit code
  expires_at          timestamptz not null,
  attempt_count       integer default 0 not null,  -- wrong-code attempts in current window
  block_count         integer default 0 not null,  -- how many 20-min blocks incurred
  blocked_until       timestamptz,
  resend_count        integer default 0 not null,
  resend_window_start timestamptz default now() not null,
  ip                  text,
  created_at          timestamptz default now() not null
);

-- Permanently banned emails after 3 blocks (9 total wrong attempts).
create table if not exists public.banned_emails (
  email      text primary key,
  reason     text not null default 'too_many_verification_failures',
  created_at timestamptz default now() not null
);

-- RLS on — service-role key (admin client) bypasses it; no user-level access needed.
alter table public.pending_signups enable row level security;
alter table public.banned_emails    enable row level security;

-- Clean up expired pending signups daily (optional cron in Supabase or pg_cron).
-- delete from public.pending_signups where expires_at < now() - interval '1 hour';

-- NOTE: Supabase Dashboard → Authentication → SMTP Settings must be configured
-- to use Resend SMTP so password-reset emails come from no-reply@metamorfosisllc.com.
-- Resend SMTP host: smtp.resend.com  port: 465  user: resend  password: <RESEND_API_KEY>
-- Sender: Metamorfosis <no-reply@metamorfosisllc.com>
