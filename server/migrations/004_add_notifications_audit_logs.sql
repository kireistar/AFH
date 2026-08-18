-- =====================================================================
-- AFH - AI-Assisted IT Lifecycle with Behavioral Detection
-- Migration 004: Notifications & Audit Logs
-- Target: Supabase (PostgreSQL 15+)
--
-- Fixes a real gap: the Notification and AuditLog SQLAlchemy models and
-- the notifications router / audit service are live in main.py, but
-- migrations 001-003 never created these tables, so any call to
-- GET /api/v1/notifications (or any audit-log write) 500s.
--
-- Roles used by the app: 'user', 'admin', 'manager', 'finance'
-- (see server/app/core/dependencies.py and migration 001 chk_users_role).
-- Idempotent: safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. notifications
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    message     TEXT            NOT NULL,
    type        VARCHAR(50)     NOT NULL DEFAULT 'info',
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON public.notifications (user_id, is_read);

COMMENT ON TABLE public.notifications IS 'In-app notifications for users (approval, fine, handover, system)';

-- ---------------------------------------------------------------------
-- 2. audit_logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID            REFERENCES public.users(id) ON DELETE SET NULL,
    action      VARCHAR(100)    NOT NULL,
    entity_type VARCHAR(50)     NOT NULL,
    entity_id   VARCHAR(100),
    details     TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor   ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at);

COMMENT ON TABLE public.audit_logs IS 'Append-only audit trail of admin/manager actions (CRUD, approvals, fines)';

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs    ENABLE ROW LEVEL SECURITY;

-- Users only see their own notifications; admins/managers can read all.
CREATE POLICY notifications_user_isolation ON public.notifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY notifications_admin_read_all ON public.notifications
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    ));

-- Audit logs are visible to admins/managers only.
CREATE POLICY audit_logs_admin_only ON public.audit_logs
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    ));
