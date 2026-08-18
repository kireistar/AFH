-- =====================================================================
-- AFH - AI-Assisted IT Lifecycle with Behavioral Detection
-- Migration 005: Long-Term Loan Support
-- Target: Supabase (PostgreSQL 15+)
--
-- Adds support for long-term loans (user keeps the asset until they
-- leave the company) and the weekly-check review flag:
--   * is_long_term  -> user requested the asset for an extended period
--   * needs_review  -> weekly check flagged the loan for admin action
--                      (asset no longer with user OR user inactive)
--
-- Idempotent: safe to run more than once.
-- =====================================================================

ALTER TABLE public.asset_requests
    ADD COLUMN IF NOT EXISTS is_long_term  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS needs_review  BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.asset_requests.is_long_term IS 'True jika user request asset jangka panjang (sampai selesai bekerja di perusahaan)';
COMMENT ON COLUMN public.asset_requests.needs_review IS 'True jika weekly check menandai loan untuk review admin (asset tidak lagi bersama user / user tidak aktif)';
