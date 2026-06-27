-- =====================================================================
-- AFH - AI-Assisted IT Lifecycle with Behavioral Detection
-- Migration 003: Dynamic System Settings
-- Target: Supabase (PostgreSQL 15+)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key                 VARCHAR(50)         PRIMARY KEY,
    value               TEXT                NOT NULL,
    description         TEXT,
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_by          UUID                REFERENCES public.users(id) ON DELETE SET NULL
);

-- Seed initial daily_fine_rate: 50000 IDR
INSERT INTO public.system_settings (key, value, description)
VALUES ('daily_fine_rate', '50000', 'Fine rate (in Rupiah) charged per day for late asset returns')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.system_settings IS 'Corporate and system configuration parameters';
