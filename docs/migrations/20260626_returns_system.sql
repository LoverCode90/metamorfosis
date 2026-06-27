-- ─────────────────────────────────────────────────────────────────────────
-- 20260626_returns_system.sql
-- Sixth pass: returns system completion + terms acceptance logging.
-- Run in the Supabase SQL editor (or via the migration runner).
-- ─────────────────────────────────────────────────────────────────────────

-- B1: item-condition disclosure stored on the case.
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS condition text;

-- B4: carrier name from the chosen Shippo rate, used in the approval email
-- (never hardcoded). Populated when a return label is generated.
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS carrier_name text;

-- B5: allow the "fraud" status for cases flagged on photo/condition mismatch.
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'fraud';

-- B6: legal record of Terms & Conditions acceptance at checkout.
CREATE TABLE IF NOT EXISTS terms_acceptance_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  order_id      uuid REFERENCES orders(id) ON DELETE SET NULL,
  accepted_at   timestamptz NOT NULL DEFAULT now(),
  ip_address    text,
  user_agent    text,
  terms_version text NOT NULL DEFAULT 'v1.0'
);

ALTER TABLE terms_acceptance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read acceptance logs" ON terms_acceptance_log;
CREATE POLICY "Admins can read acceptance logs"
  ON terms_acceptance_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
