-- ─────────────────────────────────────────────────────────────────────────
-- 20260629_cases_admin_panel.sql
-- Cases flow + admin panel completion.
-- Run in the Supabase SQL editor (or via the migration runner).
-- ─────────────────────────────────────────────────────────────────────────

-- Customer-facing resolution message written by the admin on approve/reject.
-- Distinct from `admin_notes`, which stays internal.
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS resolution text;

-- Timestamp recorded when the admin clicks "Request More Info" (mailto trigger).
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS more_info_requested_at timestamptz;

-- NOTE: `condition` (text, nullable) was already added in
-- 20260626_returns_system.sql — no action needed here.

-- NOTE: the case_status enum uses the value `pending_review` (not
-- `under_review`). The admin badge helper maps both spellings to the same
-- "secondary" badge, so no enum change is required.

-- Saved Shippo rate id so the admin can purchase the shipping label later
-- via Shippo transaction.create without re-quoting rates.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shippo_rate_id text;
