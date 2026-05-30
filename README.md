AI-Assisted IT Asset Lifecycle with Behavioral Risk Detection
Sistem ini adalah platform manajemen aset proaktif yang mengintegrasikan Machine Learning dan Cybersecurity untuk mencegah kelalaian pengguna serta meminimalisasi manipulasi data.

Sistem konvensional seringkali gagal mendeteksi risiko kerusakan aset atau mencegah pencurian identitas secara real-time. Solusi ini dirancang untuk mengubah alur kerja manajemen IT dari sistem reaktif menjadi proaktif melalui analisis riwayat peminjam dan pengamanan basis data tingkat lanjut.

Fitur Utama
AI Behavioral Risk Detection: Menggunakan model Random Forest untuk mengalkulasi skor risiko secara dinamis dengan mempertimbangkan frekuensi kerusakan dan ketepatan waktu pengembalian aset oleh pengguna.

Digital Handshake (Non-Repudiation): Mengamankan proses serah terima barang melalui mekanisme tanda tangan kriptografi, memastikan pengguna tidak dapat menyangkal identitas saat meminjam alat.

Immutable Audit Trail (Anti-Tampering): Menggunakan sistem hashing berantai (chain-hashing) pada catatan transaksi untuk memberikan notifikasi otomatis jika administrator jahat mencoba menghapus atau memodifikasi log basis data.

Teknologi yang Digunakan
Frontend: Antarmuka klien dibangun dengan React 19, Vite, dan dipoles menggunakan utilitas TailwindCSS 4.

Backend: Sisi server menggunakan framework FastAPI (Python), dengan pengelolaan basis data relasional melalui SQLAlchemy.

Autentikasi & Keamanan: Integrasi session difasilitasi oleh JWT (python-jose), sementara hashing kata sandi standar menggunakan Bcrypt (passlib) [cite: kireistar/afh/AFH-d89058c7
