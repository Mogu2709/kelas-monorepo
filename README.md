# 📚 Kelas Dashboard

Platform manajemen kelas berbasis web — chat, tugas, materi, absensi, jadwal, dan pengumuman dalam satu tempat.

**Stack:** React + Vite · Express · Prisma · PostgreSQL

---

## Fitur

| Fitur | Admin | Mahasiswa |
|---|---|---|
| Dashboard ringkasan kelas | ✅ | ✅ |
| Chat kelas real-time | ✅ | ✅ |
| Pengumuman | ✅ buat/hapus | ✅ lihat |
| Tugas (buat, update terkumpul, hapus) | ✅ | ✅ lihat |
| Materi / Modul (upload file / URL) | ✅ | ✅ download |
| Jadwal kuliah mingguan | ✅ | ✅ |
| Absensi per pertemuan | ✅ | ✅ |
| Kelola akun mahasiswa | ✅ | — |

---

## Struktur Folder

```
kelas-monorepo/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, TopBar, MessageBar (chat)
│   │   │   ├── sections/      # Halaman per fitur
│   │   │   └── ui/            # Komponen reusable
│   │   ├── context/           # AuthContext, AppContext
│   │   ├── hooks/             # useApi, useMutation
│   │   ├── lib/               # api.js — semua HTTP request
│   │   └── styles/
│   └── package.json
├── backend/                   # Express + Prisma
│   ├── src/
│   │   ├── routes/            # auth, users, tugas, materi, chat, dll
│   │   ├── middleware/        # JWT auth guard
│   │   └── lib/               # prisma client, jwt, response helper
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js            # data awal
│   │   └── migrations/
│   ├── uploads/               # file materi yang diupload (git-ignored)
│   └── package.json
└── package.json               # root — npm workspaces
```

---

## Cara Clone & Jalankan di Laptop Baru

### Prerequisites

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org) v18 atau lebih baru — cek: `node -v`
- [Git](https://git-scm.com) — cek: `git --version`
- [PostgreSQL](https://www.postgresql.org/download/) v14+ — cek: `psql --version`

---

### Step 1 — Clone repo

```bash
git clone https://github.com/USERNAME/kelas-monorepo.git
cd kelas-monorepo
```

---

### Step 2 — Install semua dependency

```bash
# Dari root folder — install backend + frontend sekaligus
npm install
```

---

### Step 3 — Buat database PostgreSQL

**Linux / Mac:**
```bash
psql -U postgres -c "CREATE DATABASE kelas_dashboard;"
```

**Windows (buka SQL Shell / pgAdmin):**
```sql
CREATE DATABASE kelas_dashboard;
```

---

### Step 4 — Setup environment backend

```bash
cd backend
cp .env.example .env
```

Edit file `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_KAMU@localhost:5432/kelas_dashboard"
JWT_SECRET="isi_string_random_panjang_di_sini"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

> Ganti `PASSWORD_KAMU` dengan password PostgreSQL kamu.
>
> Generate JWT secret yang aman:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### Step 5 — Migrasi database & seed data awal

```bash
# Masih di folder backend
npx prisma migrate deploy   # buat semua tabel
node prisma/seed.js         # isi data awal
```

Atau pakai npm script:
```bash
npm run db:push   # alternatif migrate (development)
npm run db:seed   # seed data
```

---

### Step 6 — Jalankan aplikasi

**Cara 1 — Jalankan keduanya sekaligus (dari root):**
```bash
cd ..   # kembali ke root
npm run dev
```

**Cara 2 — Jalankan terpisah di dua terminal:**

Terminal 1 — backend:
```bash
cd backend
npm run dev
# → 🚀 Backend berjalan di http://localhost:3001
```

Terminal 2 — frontend:
```bash
cd frontend
npm run dev
# → Local: http://localhost:5173
```

Buka browser ke **http://localhost:5173** ✅

---

## Akun Default (setelah seed)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Mahasiswa | `rizka` | `rizka123` |
| Mahasiswa | `bima` | `bima123` |
| Mahasiswa | `dina` | `dina123` |
| Mahasiswa | `aldi` | `aldi123` |
| Mahasiswa | `siti` | `siti123` |
| Mahasiswa | `yoga` | `yoga123` |

> ⚠️ Ganti password setelah login pertama, terutama akun admin.

---

## Prisma Commands

```bash
cd backend

npm run db:push      # sync schema ke DB tanpa migration file (development)
npm run db:migrate   # buat migration file baru
npm run db:seed      # isi ulang data awal
npm run db:studio    # buka Prisma Studio — GUI untuk lihat/edit data
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, dapat JWT token |
| POST | `/api/auth/logout` | User | Logout |
| GET | `/api/auth/me` | User | Info user aktif |

### Users
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/users` | Admin | Daftar semua user |
| POST | `/api/users` | Admin | Buat akun baru |
| DELETE | `/api/users/:id` | Admin | Hapus akun |
| PATCH | `/api/users/:id/password` | User/Admin | Ganti password |

### Kelas
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/kelas` | User | Info kelas + statistik |
| GET | `/api/kelas/matkul` | User | Daftar mata kuliah |

### Pengumuman
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/pengumuman` | User | Daftar pengumuman |
| POST | `/api/pengumuman` | Admin | Buat pengumuman |
| PATCH | `/api/pengumuman/:id` | Admin | Edit pengumuman |
| DELETE | `/api/pengumuman/:id` | Admin | Hapus pengumuman |

### Tugas
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/tugas` | User | Daftar tugas |
| POST | `/api/tugas` | Admin | Buat tugas |
| PATCH | `/api/tugas/:id` | Admin | Update tugas (terkumpul, status, deadline) |
| DELETE | `/api/tugas/:id` | Admin | Hapus tugas |

### Materi
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/materi` | User | Daftar materi |
| POST | `/api/materi` | Admin | Upload file atau simpan URL eksternal |
| PATCH | `/api/materi/:id` | Admin | Edit metadata materi |
| DELETE | `/api/materi/:id` | Admin | Hapus materi + file dari server |

> Upload file: gunakan `multipart/form-data` dengan field `file` dan `matkulId`.
> File tersimpan di `backend/uploads/` dan diakses via `GET /uploads/<filename>`.

### Chat
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/chat` | User | Ambil pesan (max 50, support pagination) |
| POST | `/api/chat` | User | Kirim pesan |
| DELETE | `/api/chat/:id` | User/Admin | Hapus pesan milik sendiri atau semua (admin) |

### Jadwal
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/jadwal` | User | Jadwal mingguan |
| POST | `/api/jadwal` | Admin | Tambah jadwal |
| DELETE | `/api/jadwal/:id` | Admin | Hapus jadwal |

### Absensi
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/absensi` | User | Rekap absensi |
| POST | `/api/absensi` | Admin | Buat sesi absensi |
| POST | `/api/absensi/:id/detail` | Admin | Input hadir/izin/alpha per mahasiswa |

---

## Troubleshooting

**`Error: relation "users" does not exist`**
→ Migration belum jalan. Jalankan `npx prisma migrate deploy` di folder `backend/`.

**`Error: P3006 migration failed to apply`**
→ Database tidak sinkron. Reset dengan:
```bash
npx prisma migrate reset --force
node prisma/seed.js
```

**`Error: Invalid DATABASE_URL`**
→ Cek format di `.env`: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME`

**`EADDRINUSE: port 3001 already in use`**
→ Ada proses lain di port itu. Kill dulu:
```bash
npx kill-port 3001
```

**Frontend tidak bisa konek ke backend (CORS error)**
→ Pastikan `VITE_API_URL=http://localhost:3001/api` ada di `frontend/.env` dan backend sudah jalan.

**Upload file tidak muncul setelah deploy ke cloud**
→ Folder `uploads/` di server bersifat sementara (ephemeral filesystem). Untuk production gunakan cloud storage seperti Cloudinary atau Supabase Storage.

---

## Deploy

| Bagian | Platform | Catatan |
|---|---|---|
| Backend + Database | [Railway](https://railway.app) | PostgreSQL sudah termasuk, gratis $5 credit/bulan |
| Frontend | [Vercel](https://vercel.com) | Gratis, auto-deploy dari GitHub |

**Langkah singkat Railway (backend):**
```bash
cd backend
railway login
railway init       # buat project baru
railway add --plugin postgresql
railway up
railway variables set JWT_SECRET=xxx NODE_ENV=production FRONTEND_URL=https://xxx.vercel.app
railway run npx prisma migrate deploy
railway run node prisma/seed.js
```

**Langkah singkat Vercel (frontend):**
```bash
cd frontend
# Buat file .env.production dengan VITE_API_URL=https://xxx.up.railway.app/api
vercel --prod
```

---

## Tech Stack

- **Frontend:** React 18, Vite, CSS custom properties (no UI framework)
- **Backend:** Express 4, Prisma 5, bcryptjs, jsonwebtoken, Multer
- **Database:** PostgreSQL
- **Auth:** JWT — token disimpan di localStorage
