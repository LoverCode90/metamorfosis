-- 20260623_surcharge_and_consents.sql
-- FASE 2 prerequisite. Adds the 2.6% card surcharge amount and the consent
-- audit columns (timestamp + IP) for the surcharge and the chemical/non-
-- returnable warning to the orders table.
--
-- NOT YET APPLIED. Run in Supabase Dashboard -> SQL Editor before deploying
-- the FASE 2 (surcharge + consents) code.
--
-- Note: orders.terms_accepted already exists as a boolean. The cases.explanation
-- CHECK relaxation (100 -> 40) lives in 20260623_cases_explanation_min.sql, so
-- it is intentionally NOT repeated here.

-- Surcharge amount charged on the order, in integer cents.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS surcharge_cents integer NOT NULL DEFAULT 0;

-- Consent audit trail (when + from which IP the customer accepted each notice).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS surcharge_consented_at         timestamptz,
  ADD COLUMN IF NOT EXISTS surcharge_consented_ip         text,
  ADD COLUMN IF NOT EXISTS chemical_warning_consented_at  timestamptz,
  ADD COLUMN IF NOT EXISTS chemical_warning_consented_ip  text;
