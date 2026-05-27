-- =====================================================================
-- AFH - AI-Assisted IT Lifecycle with Behavioral Detection
-- Migration 001: Schema (revised)
-- Target: Supabase (PostgreSQL 15+)
--
-- CATATAN PENTING:
--   Tabel `users` SUDAH dibuat sebelumnya dengan UUID PK & HR lifecycle.
--   File ini:
--     1) Meng-ALTER tabel users untuk menutup gap (email, updated_at,
--        constraint, index, dll)
--     2) Membuat seluruh tabel lain dengan FK UUID ke users(id)
--
-- Mapping ke Data Stores Form 3:
--   D1 User & Risk DB      -> users (existing, dipatch di section 2) +
--                             user_behavior_stats
--   D2 Asset Inventory     -> assets
--   D3 Transaction Ledger  -> transactions (append-only, chained hash)
--   D4 Invoice DB          -> invoices
--
-- Tabel pendukung:
--   - asset_requests       (form submission + AI risk routing)
--   - incidents            ("Report Broken Device")
--   - handover_tokens      (QR + Ed25519 Secure Handover)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extension yang dibutuhkan
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), digest()
CREATE EXTENSION IF NOT EXISTS "citext";     -- email case-insensitive

-- ---------------------------------------------------------------------
-- 2. PATCH tabel `users` yang sudah ada
--    Tujuan: tambah email, updated_at, last_login_at;
--            tambah CHECK constraint untuk type-safety;
--            tambah index untuk kolom filter umum;
--            fix public_key supaya nullable (user baru belum punya keypair).
-- ---------------------------------------------------------------------

-- 2a. Email (REQUIRED per Form 3 spec login)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email CITEXT;
-- Backfill kalau sudah ada data dummy:
UPDATE public.users
   SET email = LOWER(REPLACE(employee_name, ' ', '.')) || '@afh.com'
 WHERE email IS NULL;
ALTER TABLE public.users
    ALTER COLUMN email SET NOT NULL,
    ADD CONSTRAINT users_email_key UNIQUE (email);

-- 2b. Audit timestamps
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2c. Public key nullable (user baru sign-up belum punya Ed25519 keypair)
ALTER TABLE public.users
    ALTER COLUMN public_key DROP NOT NULL;

-- 2d. CHECK constraints (type-safety untuk kolom TEXT)
ALTER TABLE public.users
    ADD CONSTRAINT chk_users_role
        CHECK (role IN ('user', 'admin', 'manager', 'finance')),
    ADD CONSTRAINT chk_users_risk_score
        CHECK (risk_score BETWEEN 0 AND 100),
    ADD CONSTRAINT chk_users_risk_tier
        CHECK (risk_score_tier IN ('Low', 'Medium', 'High')),
    ADD CONSTRAINT chk_users_employment
        CHECK (employment_status IN ('Active', 'On Leave', 'Suspended', 'Resigned')),
    ADD CONSTRAINT chk_users_clearance
        CHECK (clearance_level BETWEEN 1 AND 5);

-- 2e. Indexes untuk kolom yang sering jadi filter
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_risk_tier    ON public.users (risk_score_tier);
CREATE INDEX IF NOT EXISTS idx_users_employment   ON public.users (employment_status);
CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users (email);

-- 2f. Comments untuk dokumentasi (muncul di Supabase Studio)
COMMENT ON TABLE  public.users IS 'D1 - User & Risk Database (UUID PK, HR lifecycle, AI risk profile)';
COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash via passlib di FastAPI backend';
COMMENT ON COLUMN public.users.public_key    IS 'Ed25519 public key base64 (nullable; di-generate saat first handover)';
COMMENT ON COLUMN public.users.clearance_level IS '1=basic user, 2=lead, 3=admin/finance, 4=manager, 5=director';

-- ---------------------------------------------------------------------
-- 3. Trigger function: auto-update updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- 4. ENUM TYPES (untuk tabel non-users; users sengaja pakai TEXT+CHECK
--    biar konsisten dengan struktur existing kamu)
-- ---------------------------------------------------------------------
CREATE TYPE asset_category     AS ENUM ('laptop', 'desktop', 'mobile', 'peripheral',
                                        'projector', 'server', 'network', 'other');
CREATE TYPE asset_condition    AS ENUM ('good', 'minor_damage', 'damaged', 'lost');
CREATE TYPE asset_status       AS ENUM ('available', 'borrowed', 'maintenance', 'retired');

CREATE TYPE request_status     AS ENUM ('pending_admin', 'pending_manager', 'approved',
                                        'rejected', 'handed_over', 'returned', 'cancelled');

CREATE TYPE transaction_action AS ENUM ('handover', 'return', 'incident_report',
                                        'fine_issued', 'fine_paid', 'verification');
CREATE TYPE transaction_status AS ENUM ('pending', 'committed', 'verified', 'tampered');

CREATE TYPE invoice_status     AS ENUM ('unpaid', 'pending_verification', 'paid', 'cancelled');
CREATE TYPE payment_method     AS ENUM ('bank_transfer', 'cash', 'e_wallet', 'payroll_deduction');

CREATE TYPE incident_severity  AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status    AS ENUM ('open', 'investigating', 'resolved', 'closed');

CREATE TYPE token_status       AS ENUM ('active', 'used', 'expired', 'revoked');

-- =====================================================================
-- D2 :: ASSETS
-- =====================================================================
CREATE TABLE public.assets (
    id                  BIGSERIAL           PRIMARY KEY,
    asset_code          VARCHAR(20)         UNIQUE NOT NULL,   -- AST-0101
    asset_name          VARCHAR(150)        NOT NULL,
    category            asset_category      NOT NULL,
    model               VARCHAR(100),
    serial_number       VARCHAR(100)        UNIQUE,
    purchase_value      NUMERIC(15,2)       NOT NULL DEFAULT 0
                        CHECK (purchase_value >= 0),
    location            VARCHAR(100),

    current_condition   asset_condition     NOT NULL DEFAULT 'good',
    status              asset_status        NOT NULL DEFAULT 'available',

    notes               TEXT,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_status     ON public.assets (status);
CREATE INDEX idx_assets_category   ON public.assets (category);
CREATE INDEX idx_assets_condition  ON public.assets (current_condition);

CREATE TRIGGER trg_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE public.assets IS 'D2 - Asset Inventory';

-- =====================================================================
-- ASSET_REQUESTS  (workflow: user submit -> AI score -> admin/manager)
-- FK user_id, approved_by -> UUID (mengikuti users.id)
-- =====================================================================
CREATE TABLE public.asset_requests (
    id                  BIGSERIAL           PRIMARY KEY,
    request_code        VARCHAR(20)         UNIQUE NOT NULL,   -- REQ-0013
    user_id             UUID                NOT NULL REFERENCES public.users(id)  ON DELETE RESTRICT,
    asset_id            BIGINT              NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,

    reason              TEXT                NOT NULL,
    requested_start     DATE                NOT NULL,
    requested_end       DATE                NOT NULL,
    CHECK (requested_end >= requested_start),

    -- Snapshot hasil AI saat request dibuat (immutable per-request)
    risk_score_snapshot NUMERIC(5,2)        NOT NULL DEFAULT 0
                        CHECK (risk_score_snapshot BETWEEN 0 AND 100),
    risk_tier_snapshot  TEXT                NOT NULL DEFAULT 'Low'
                        CHECK (risk_tier_snapshot IN ('Low', 'Medium', 'High')),
    ai_decision_reason  TEXT,

    status              request_status      NOT NULL DEFAULT 'pending_admin',
    approved_by         UUID                REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    rejection_reason    TEXT,

    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_user     ON public.asset_requests (user_id);
CREATE INDEX idx_requests_asset    ON public.asset_requests (asset_id);
CREATE INDEX idx_requests_status   ON public.asset_requests (status);
CREATE INDEX idx_requests_created  ON public.asset_requests (created_at DESC);

CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON public.asset_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE public.asset_requests IS 'Workflow request asset; di-route oleh AI risk service';

-- =====================================================================
-- D3 :: TRANSACTIONS (APPEND-ONLY LEDGER)
-- =====================================================================
CREATE TABLE public.transactions (
    id                  BIGSERIAL           PRIMARY KEY,
    transaction_code    VARCHAR(20)         UNIQUE NOT NULL,   -- TXN-000001
    request_id          BIGINT              REFERENCES public.asset_requests(id) ON DELETE RESTRICT,
    asset_id            BIGINT              NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
    borrower_id         UUID                NOT NULL REFERENCES public.users(id)  ON DELETE RESTRICT,
    admin_id            UUID                REFERENCES public.users(id)  ON DELETE RESTRICT,

    action              transaction_action  NOT NULL,
    payload             JSONB               NOT NULL,           -- snapshot data event

    -- Chained hashing fields
    previous_hash       VARCHAR(64),                            -- NULL untuk genesis
    current_hash        VARCHAR(64)         NOT NULL UNIQUE,    -- SHA-256 hex
    signature           TEXT,                                   -- Ed25519 base64

    status              transaction_status  NOT NULL DEFAULT 'committed',
    occurred_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_asset     ON public.transactions (asset_id);
CREATE INDEX idx_transactions_borrower  ON public.transactions (borrower_id);
CREATE INDEX idx_transactions_action    ON public.transactions (action);
CREATE INDEX idx_transactions_occurred  ON public.transactions (occurred_at DESC);
CREATE INDEX idx_transactions_prev_hash ON public.transactions (previous_hash);

-- Append-only enforcement: tolak UPDATE & DELETE di level DB.
CREATE OR REPLACE FUNCTION transactions_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Transactions ledger is append-only. UPDATE/DELETE rejected on row id=%', OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_no_update
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION transactions_append_only();

CREATE TRIGGER trg_transactions_no_delete
BEFORE DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION transactions_append_only();

COMMENT ON TABLE  public.transactions       IS 'D3 - Immutable Transaction Ledger (append-only)';
COMMENT ON COLUMN public.transactions.current_hash IS 'SHA-256 hex dari (previous_hash || payload || occurred_at)';
COMMENT ON COLUMN public.transactions.signature    IS 'Ed25519 signature dari current_hash (non-repudiation)';

-- =====================================================================
-- D4 :: INVOICES
-- Auto-generated saat return = damaged/late. Fine = purchase_value * 2.
-- =====================================================================
CREATE TABLE public.invoices (
    id                  BIGSERIAL           PRIMARY KEY,
    invoice_code        VARCHAR(20)         UNIQUE NOT NULL,    -- INV-1022
    transaction_id      BIGINT              NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
    user_id             UUID                NOT NULL REFERENCES public.users(id)        ON DELETE RESTRICT,

    fine_amount         NUMERIC(15,2)       NOT NULL CHECK (fine_amount >= 0),
    reason              TEXT                NOT NULL,
    status              invoice_status      NOT NULL DEFAULT 'unpaid',

    payment_method      payment_method,
    payment_proof_url   TEXT,                                   -- bukti upload (Supabase Storage)
    paid_at             TIMESTAMPTZ,
    verified_by         UUID                REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at         TIMESTAMPTZ,

    due_date            DATE,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user    ON public.invoices (user_id);
CREATE INDEX idx_invoices_status  ON public.invoices (status);
CREATE INDEX idx_invoices_txn     ON public.invoices (transaction_id);

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE public.invoices IS 'D4 - Invoice / Penalty Database';

-- =====================================================================
-- INCIDENTS  (Report Broken Device dari UserDashboard.jsx)
-- =====================================================================
CREATE TABLE public.incidents (
    id                  BIGSERIAL           PRIMARY KEY,
    incident_code       VARCHAR(20)         UNIQUE NOT NULL,    -- INC-0001
    reporter_id         UUID                NOT NULL REFERENCES public.users(id)  ON DELETE RESTRICT,
    asset_id            BIGINT              REFERENCES public.assets(id) ON DELETE SET NULL,

    description         TEXT                NOT NULL,
    severity            incident_severity   NOT NULL DEFAULT 'medium',
    status              incident_status     NOT NULL DEFAULT 'open',

    resolved_by         UUID                REFERENCES public.users(id) ON DELETE SET NULL,
    resolution_notes    TEXT,
    resolved_at         TIMESTAMPTZ,

    reported_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_reporter  ON public.incidents (reporter_id);
CREATE INDEX idx_incidents_asset     ON public.incidents (asset_id);
CREATE INDEX idx_incidents_status    ON public.incidents (status);

CREATE TRIGGER trg_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE public.incidents IS 'Laporan kerusakan/insiden device dari user';

-- =====================================================================
-- HANDOVER_TOKENS  (QR + Ed25519 Secure Handover)
-- =====================================================================
CREATE TABLE public.handover_tokens (
    id                  BIGSERIAL           PRIMARY KEY,
    token               VARCHAR(128)        UNIQUE NOT NULL,
    request_id          BIGINT              NOT NULL REFERENCES public.asset_requests(id) ON DELETE CASCADE,
    issued_by           UUID                NOT NULL REFERENCES public.users(id),
    signature           TEXT                NOT NULL,

    issued_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ         NOT NULL,
    scanned_at          TIMESTAMPTZ,
    scanned_by          UUID                REFERENCES public.users(id) ON DELETE SET NULL,

    status              token_status        NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_tokens_request  ON public.handover_tokens (request_id);
CREATE INDEX idx_tokens_status   ON public.handover_tokens (status);
CREATE INDEX idx_tokens_expires  ON public.handover_tokens (expires_at);

COMMENT ON TABLE public.handover_tokens IS 'QR token dinamis (Ed25519 signed) untuk Secure Handover';

-- =====================================================================
-- USER_BEHAVIOR_STATS  (aggregate untuk feed Random Forest)
-- =====================================================================
CREATE TABLE public.user_behavior_stats (
    user_id             UUID                PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_borrows       INT                 NOT NULL DEFAULT 0,
    total_returns       INT                 NOT NULL DEFAULT 0,
    on_time_returns     INT                 NOT NULL DEFAULT 0,
    late_returns        INT                 NOT NULL DEFAULT 0,
    damage_count        INT                 NOT NULL DEFAULT 0,
    lost_count          INT                 NOT NULL DEFAULT 0,
    total_fines         NUMERIC(15,2)       NOT NULL DEFAULT 0,
    unpaid_fines        NUMERIC(15,2)       NOT NULL DEFAULT 0,
    last_calculated_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_behavior_stats IS 'Aggregate behavior - input fitur untuk model Random Forest';

-- =====================================================================
-- RLS: ENABLE di semua tabel TANPA policy.
-- Efeknya:
--   - service_role key (dipakai FastAPI backend) -> tetap full access
--     karena service_role secara default BYPASS RLS di Supabase.
--   - anon key (frontend tanpa login)            -> diblokir total.
--   - authenticated key (Supabase Auth login)    -> diblokir total.
-- Jadi defense-in-depth: kalau anon key bocor / dipakai accidentally,
-- data tetap aman. Backend FastAPI yang authorize semua access.
--
-- Kalau nanti mau frontend akses Supabase langsung (mis. realtime),
-- baru tulis CREATE POLICY per tabel sesuai kebutuhan.
-- =====================================================================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_tokens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_stats ENABLE ROW LEVEL SECURITY;
