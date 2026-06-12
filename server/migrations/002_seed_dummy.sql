-- =====================================================================
-- AFH - Migration 002: Seed Dummy Data (revised, UUID-aware)
-- Disesuaikan dengan struktur tabel users existing:
--   id (UUID), employee_id, employee_name, role (text), department,
--   clearance_level (smallint), employment_status, hire_date,
--   risk_score, risk_score_tier, password_hash, public_key (now nullable),
--   email (ditambah oleh migration 001)
--
-- Password semua user: "password123"
-- Bcrypt hash di bawah ini REAL (rounds=12), siap dipakai login.
-- Generate ulang dengan:
--   python -c "from passlib.hash import bcrypt; print(bcrypt.using(rounds=12).hash('password123'))"
--
-- Catatan: Supabase SQL Editor TIDAK support \set (itu meta-command psql CLI),
-- jadi hash di-inline langsung di setiap INSERT.
-- =====================================================================

-- ---------------------------------------------------------------------
-- USERS (6 user: 1 admin, 1 manager, 1 finance, 3 user dengan risk berbeda)
-- ---------------------------------------------------------------------
INSERT INTO public.users
    (employee_id, employee_name, email, role, department,
     clearance_level, employment_status, hire_date,
     risk_score, risk_score_tier, password_hash)
VALUES
('EMP-0001', 'Budi Santoso',       'budi.santoso@afh.com',  'user',    'IT Engineering', 1, 'Active', '2023-01-15', 15.00, 'Low',    '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW'),
('EMP-0002', 'Administrator',      'admin@afh.com',         'admin',   'IT Operations',  3, 'Active', '2022-03-01',  5.00, 'Low',    '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW'),
('EMP-0003', 'Operations Manager', 'manager@afh.com',       'manager', 'Management',     4, 'Active', '2021-06-10',  0.00, 'Low',    '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW'),
('EMP-0004', 'Finance Officer',    'finance@afh.com',       'finance', 'Finance',        3, 'Active', '2022-09-20',  0.00, 'Low',    '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW'),
('EMP-0005', 'Dewi Lestari',       'dewi.lestari@afh.com',  'user',    'Sales',          1, 'Active', '2023-04-05', 78.50, 'High',   '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW'),
('EMP-0006', 'Agus Pratama',       'agus.pratama@afh.com',  'user',    'Engineering',    1, 'Active', '2023-08-12', 45.00, 'Medium', '$2b$12$8emcc6PBzepbC83wIdlVPOA6Ujsk2ES6PGtEDuVIvdPDmEPvat3CW');

-- Inisialisasi row behavior_stats untuk setiap user
INSERT INTO public.user_behavior_stats (user_id)
SELECT id FROM public.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_behavior_stats s WHERE s.user_id = public.users.id
);

-- ---------------------------------------------------------------------
-- ASSETS
-- ---------------------------------------------------------------------
INSERT INTO public.assets
    (asset_code, asset_name, category, brand, serial_number, purchase_value,
     location, current_condition, status)
VALUES
('AST-0101', 'MacBook Pro M2',      'laptop',     'Apple',    'SN-MBP-001', 35000000, 'IT Storage A', 'good', 'available'),
('AST-0102', 'Lenovo ThinkPad X1',  'laptop',     'Lenovo',   'SN-LTP-002', 28000000, 'IT Storage A', 'good', 'borrowed'),
('AST-0205', 'Wireless Mouse',      'peripheral', 'Logitech', 'SN-LMX-005',  1200000, 'IT Storage B', 'good', 'borrowed'),
('AST-0310', 'Epson Projector',     'projector',  'Epson',    'SN-EPS-010',  8500000, 'Meeting Rm 1', 'good', 'available'),
('AST-0420', 'iPad Pro',            'mobile',     'Apple',    'SN-IPD-020', 18000000, 'IT Storage A', 'good', 'available'),
('AST-0530', 'Dell PowerEdge R740', 'server',     'Dell',     'SN-DPE-030', 95000000, 'Data Center',  'good', 'available');

-- ---------------------------------------------------------------------
-- ASSET REQUEST + LEDGER (DEMO FLOW)
-- Dewi (high risk) request iPad -> escalated ke manager -> approved
-- -> handover transaction (genesis hash)
-- ---------------------------------------------------------------------
INSERT INTO public.asset_requests
    (request_code, user_id, asset_id, reason, requested_start, requested_end,
     risk_score_snapshot, risk_tier_snapshot, ai_decision_reason,
     status, approved_by, approved_at)
VALUES
('REQ-0013',
 (SELECT id FROM public.users  WHERE employee_id='EMP-0005'),
 (SELECT id FROM public.assets WHERE asset_code='AST-0420'),
 'Field Work Client Meeting',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days',
 85.00, 'High', 'High-value asset & field work',
 'approved',
 (SELECT id FROM public.users WHERE employee_id='EMP-0003'),
 NOW());

-- Genesis transaction (handover); previous_hash NULL
INSERT INTO public.transactions
    (transaction_code, request_id, asset_id, borrower_id, admin_id,
     action, payload, previous_hash, current_hash, signature, status)
VALUES
('TXN-000001',
 (SELECT id FROM public.asset_requests WHERE request_code='REQ-0013'),
 (SELECT id FROM public.assets         WHERE asset_code  ='AST-0420'),
 (SELECT id FROM public.users          WHERE employee_id ='EMP-0005'),
 (SELECT id FROM public.users          WHERE employee_id ='EMP-0002'),
 'handover',
 jsonb_build_object(
    'asset_code', 'AST-0420',
    'borrower',   'EMP-0005',
    'admin',      'EMP-0002',
    'condition_at_handover', 'good',
    'notes', 'Genesis ledger entry'
 ),
 NULL,
 -- placeholder hash; production: SHA-256 dari payload
 'a1b2c3d4e5f6789012345678901234567890abcdefabcdefabcdefabcdef1234',
 'DUMMY_ED25519_SIG_BASE64_PLACEHOLDER==',
 'committed');

-- Update status setelah handover
UPDATE public.assets         SET status='borrowed'     WHERE asset_code  ='AST-0420';
UPDATE public.asset_requests SET status='handed_over'  WHERE request_code='REQ-0013';

-- ---------------------------------------------------------------------
-- INVOICE (denda Agus, kerusakan keyboard)
-- ---------------------------------------------------------------------
INSERT INTO public.transactions
    (transaction_code, asset_id, borrower_id, admin_id,
     action, payload, previous_hash, current_hash, signature, status)
VALUES
('TXN-000002',
 (SELECT id FROM public.assets WHERE asset_code='AST-0102'),
 (SELECT id FROM public.users  WHERE employee_id='EMP-0006'),
 (SELECT id FROM public.users  WHERE employee_id='EMP-0002'),
 'fine_issued',
 jsonb_build_object(
    'asset_code', 'AST-0102',
    'reason',     'Damaged keyboard, multiple keys broken',
    'fine_amount', 500000
 ),
 'a1b2c3d4e5f6789012345678901234567890abcdefabcdefabcdefabcdef1234',
 'b2c3d4e5f6789012345678901234567890abcdefabcdefabcdefabcdef123456',
 'DUMMY_ED25519_SIG_BASE64_PLACEHOLDER==',
 'committed');

INSERT INTO public.invoices
    (invoice_code, transaction_id, user_id, fine_amount, reason, status, due_date)
VALUES
('INV-1022',
 (SELECT id FROM public.transactions WHERE transaction_code='TXN-000002'),
 (SELECT id FROM public.users        WHERE employee_id='EMP-0006'),
 500000.00,
 'Damaged Laptop Keyboard (AST-0102)',
 'unpaid',
 CURRENT_DATE + INTERVAL '14 days');

-- ---------------------------------------------------------------------
-- INCIDENT contoh
-- ---------------------------------------------------------------------
INSERT INTO public.incidents
    (incident_code, reporter_id, asset_id, description, severity, status)
VALUES
('INC-0001',
 (SELECT id FROM public.users  WHERE employee_id='EMP-0001'),
 (SELECT id FROM public.assets WHERE asset_code='AST-0205'),
 'Wireless mouse scroll wheel sometimes unresponsive.',
 'low', 'open');

-- ---------------------------------------------------------------------
-- VERIFIKASI (jalankan manual)
-- ---------------------------------------------------------------------
-- SELECT employee_id, employee_name, role, risk_score_tier, employment_status FROM public.users;
-- SELECT asset_code, asset_name, status FROM public.assets;
-- SELECT transaction_code, action, previous_hash IS NULL AS is_genesis FROM public.transactions;
-- SELECT invoice_code, fine_amount, status FROM public.invoices;
