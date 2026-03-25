IT_Asset_Management/
├── client/                # React Frontend (JavaScript + Vite)
│   ├── public/            # File statis (logo.svg, favicon.ico)
│   ├── src/
│   │   ├── assets/        # Gambar & file CSS global (index.css)
│   │   ├── components/    # Komponen kecil (Button.jsx, Sidebar.jsx, Navbar.jsx)
│   │   ├── layouts/       # Template halaman (misal: AdminLayout.jsx)
│   │   ├── pages/         # Halaman utama berdasarkan aktor:
│   │   │   ├── auth/      # Login & Forgot Password
│   │   │   ├── user/      # Dashboard User & Request Asset
│   │   │   ├── admin/     # Manage Assets & Approval
│   │   │   ├── manager/   # Reports & High-Risk Approval
│   │   │   └── finance/   # Payment & Fine Verification
│   │   ├── services/      # Jembatan API (supabaseClient.js)
│   │   ├── hooks/         # Logika reusable (useAuth.js)
│   │   ├── utils/         # Helper (formatCurrency.js, formatDate.js)
│   │   ├── App.jsx        # Routing utama aplikasi
│   │   └── main.jsx       # Entry point React
│   ├── .env               # Kunci API Supabase (VITE_SUPABASE_URL)
│   ├── .gitignore         # Mencegah upload node_modules & .env
│   └── package.json       # Daftar library Frontend
│
├── server/                # FastAPI Backend (Python)
│   ├── app/
│   │   ├── api/           # Endpoint (auth_router.py, asset_router.py)
│   │   ├── core/          # Konfigurasi server (security.py, config.py)
│   │   ├── db/            # Koneksi database (session.py)
│   │   ├── models/        # Definisi Tabel DB (SQLAlchemy Models)
│   │   ├── schemas/       # Validasi data API (Pydantic Schemas)
│   │   ├── services/      # Logika Berat (ai_service.py, hashing_service.py)
│   │   └── ml_models/     # File model AI (random_forest.pkl)
│   ├── tests/             # File testing (biar nilai Capstone makin bagus!)
│   ├── .env               # Database URL & Secret Key
│   ├── .gitignore         # Mencegah upload venv & .env
│   ├── main.py            # File utama untuk menjalankan FastAPI
│   └── requirements.txt   # Daftar library Python
│
├── docs/                  # Folder Dokumentasi
│   ├── diagrams/          # Activity Diagram & ERD (File .jpg / .pdf)
│   └── reports/           # Draft laporan Capstone
│
├── .gitignore             # Gitignore level utama (Global)
├── README.md              # Panduan cara menjalankan project (PENTING!)
└── LICENSE                # Lisensi (Opsional)