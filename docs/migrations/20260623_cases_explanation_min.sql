-- 20260623_cases_explanation_min.sql
-- Lower the minimum length of cases.explanation from 100 to 40 characters.
-- The case form and its API (app/api/profile/cases/route.ts) validate against
-- 40; without this change the DB CHECK constraint rejects 40-99 char
-- explanations at INSERT time even when Zod passes.
--
-- Run in Supabase Dashboard -> SQL Editor before deploying the matching code.

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_explanation_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_explanation_check
    CHECK (char_length(explanation) >= 40);
