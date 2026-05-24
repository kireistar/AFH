# Database Migrations — AFH Capstone

Skema database untuk **AI-Assisted IT Lifecycle With Behavioral Detection**, target **Supabase (PostgreSQL 15+)**.

## File

| File | Isi |
| --- | --- |
| `001_init_schema.sql` | (1) PATCH tabel `users` existing (tambah `email`, `updated_at`, `last_login_at`, CHECK constraints, indexes; fix `public_key` jadi nullable). (2) Create 7 tabel lain (assets, asset_requests, transactions, invoices, incidents, handover_tokens, user_behavior_stats) dengan FK UUID ke `users.id`. |
| `002_seed_dummy.sql`  | Data dummy untuk dev & demo (6 user lengkap dengan `employee_id`, `hire_date`, dll sesuai skema users existing; 6 asset; 1 request workflow; 1 invoice; 1 incident) |

Jalankan secara berurutan: `001` dulu, baru `002`. **Skema users existing kamu (`employee_id`, `clearance_level`, `hire_date`, `resignation_date`, `employment_status`) tidak disentuh — cuma ditambahkan field yang hilang.**

## Mapping ke Form 3

| Data Store (Form 3)        | Tabel di skema ini                 |
| -------------------------- | ---------------------------------- |
| D1 User & Risk Database    | `users`, `user_behavior_stats`     |
| D2 Asset Inventory         | `assets`                           |
| D3 Transaction Ledger      | `transactions` (append-only + hash chain) |
| D4 Invoice Database        | `invoices`                         |

Tabel tambahan yang tidak eksplisit di Form 3 tapi *wajib ada* untuk workflow:

- `asset_requests` — menyimpan form submission user sebelum jadi transaction. Ini tempat AI risk score di-snapshot dan keputusan routing (admin vs manager) dicatat.
- `incidents` — fitur "Report Broken Device" yang sudah ada di `UserDashboard.jsx`.
- `handover_tokens` — QR token dinamis untuk Secure Handover (Tahap 5).
- `user_behavior_stats` — denormalized aggregate, jadi input fitur Random Forest tanpa harus full-scan ledger tiap kali.

## Cara Apply ke Supabase

### Opsi A — Lewat Supabase SQL Editor (paling cepat)

1. Buka project Supabase → **SQL Editor** → **New query**.
2. Copy seluruh isi `001_init_schema.sql`, paste, klik **Run**. Pastikan keluar `Success. No rows returned.`
3. Ulangi untuk `002_seed_dummy.sql`.
4. Cek di **Table Editor**: harus muncul 8 tabel baru.

### Opsi B — Lewat psql / DBeaver

```bash
# Ambil connection string Supabase (Settings → Database → Connection string → URI)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

psql "$DATABASE_URL" -f 001_init_schema.sql
psql "$DATABASE_URL" -f 002_seed_dummy.sql
```

### Rollback (kalau perlu reset total)

```sql
DROP TABLE IF EXISTS user_behavior_stats, handover_tokens, incidents,
                     invoices, transactions, asset_requests,
                     assets, users CASCADE;

DROP TYPE IF EXISTS token_status, incident_status, incident_severity,
                    payment_method, invoice_status,
                    transaction_status, transaction_action,
                    request_status, asset_status, asset_condition,
                    asset_category, risk_tier, user_clearance, user_role CASCADE;

DROP FUNCTION IF EXISTS set_updated_at(), transactions_append_only() CASCADE;
```

## Keputusan Desain (Penting saat sidang)

1. **PK strategy hybrid: UUID untuk users, BIGSERIAL untuk tabel lain.**
   `users.id` UUID (mengikuti skema existing & best-practice Supabase) — keuntungan: tidak bocor jumlah user, aman untuk sync antar environment, kompatibel kalau nanti diintegrasikan ke `auth.users` Supabase. Tabel lain pakai BIGSERIAL + kolom `*_code` terpisah (AST-0101, REQ-0013, TXN-000001) — lebih ringan untuk FK & index, dan kode-nya readable di UI.

2. **ENUM types untuk tabel non-users; TEXT + CHECK untuk users.**
   Tabel lain pakai ENUM (lebih type-safe, jelas di ERD). Tabel users tetap pakai TEXT + CHECK karena struktur existing kamu sudah TEXT — CHECK constraint sudah cukup untuk mencegah typo seperti `role='Admin'` atau `'admins'`. Kalau mau full-enum konsisten, bisa di-migrate nanti.

3. **Transactions = append-only di level DB, bukan cuma aplikasi.**
   Ada trigger `trg_transactions_no_update` dan `trg_transactions_no_delete` yang `RAISE EXCEPTION` kalau ada yang coba UPDATE/DELETE. Ini yang membuat "immutable ledger" benar-benar immutable — bahkan admin database tidak bisa diam-diam mengubah riwayat tanpa men-drop trigger dulu (yang ketahuan di audit log Supabase).

4. **Chained hashing field eksplisit.**
   `previous_hash` + `current_hash` + `signature` ada sebagai kolom. Logika hashing (SHA-256 + Ed25519 signing) dikerjakan oleh `hashing_service.py` di FastAPI — DB hanya menyimpan hasilnya. Verifikasi rantai = SELECT urut by id, recompute hash, bandingkan.

5. **`risk_score` & `risk_tier` di-snapshot per request.**
   Field `risk_score_snapshot` & `risk_tier_snapshot` di `asset_requests` mengabadikan keputusan AI saat request dibuat. Kalau user risk score-nya naik kemudian, request lama tidak ikut berubah. Penting untuk audit trail.

6. **`purchase_value` di assets.**
   Sengaja disimpan supaya rumus `fine = purchase_value * 2` (dari skenario "Automated Fine Calculation" Form 3) bisa dihitung otomatis oleh backend.

7. **RLS di-ENABLE tanpa policy (defense-in-depth).**
   `service_role` (FastAPI backend) tetap full access karena bypass RLS by default. `anon` & `authenticated` key diblokir total — jadi kalaupun key bocor atau ada developer accidentally pakai dari frontend, data tetap aman. Backend FastAPI yang authorize semua access via middleware `get_current_user` + `RoleChecker`. Kalau nanti mau frontend akses Supabase langsung (mis. realtime), baru tulis `CREATE POLICY` per tabel.

8. **`user_behavior_stats` sebagai aggregate terpisah.**
   Daripada query agregasi mahal ke `transactions` setiap kali AI dipanggil, simpan aggregate-nya. Update via trigger atau scheduled job (cron). Ini standar praktik untuk read-heavy ML feature serving.

## Diagram Relasi Singkat

```
users ──┬──< asset_requests >── assets
        │            │
        │            └──< transactions (append-only ledger)
        │                       │
        │                       └──< invoices
        │
        ├──< incidents >── assets
        ├──< handover_tokens
        └─── user_behavior_stats (1:1)
```

## Langkah Selanjutnya (Setelah Schema Live di Supabase)

1. **Update SQLAlchemy models di `server/app/core/models.py`** — saat ini cuma ada `Asset`. Perlu ditambah `User`, `AssetRequest`, `Transaction`, `Invoice`, `Incident`, `HandoverToken`, `UserBehaviorStats`.
2. **Pecah Pydantic schemas** ke file per-entity di `server/app/schemas/`.
3. **Bikin folder `server/app/services/`** untuk `hashing_service.py`, `ai_service.py`, `qr_service.py`, `auth_service.py`.
4. **Mulai Tahap 2 — Auth router + JWT + bcrypt** (langsung pakai tabel `users` yang baru).

Setelah skema ini live, kita lanjut ke Tahap 1B (SQLAlchemy models + auth) — mau langsung sekalian dibuatkan?
