# kelas.id — Monorepo

Stack: **React + Vite** (frontend) · **Express + Prisma** (backend) · **PostgreSQL** (database)

---

## Struktur folder

```
kelas-dashboard/
├── frontend/          # React app
├── backend/
│   ├── src/
│   │   ├── routes/    # auth, users, tugas, dll
│   │   ├── middleware/ # JWT guard
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
└── package.json       # root — npm workspaces
```

---

## Setup awal

### 1. Install semua dependency

```bash
npm install
```

### 2. Siapkan PostgreSQL

Pastikan PostgreSQL sudah berjalan. Buat database:

```sql
CREATE DATABASE kelas_dashboard;
```

### 3. Isi file `.env` backend

```bash
cp backend/.env backend/.env  # sudah ada, tinggal edit
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_KAMU@localhost:5432/kelas_dashboard"
JWT_SECRET="isi-dengan-string-random-panjang"
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Jalankan migrasi & seed database

```bash
cd backend
npm run db:push    # buat semua tabel
npm run db:seed    # isi data awal
```

### 5. Jalankan aplikasi

**Keduanya sekaligus (dari root):**

```bash
npm run dev
```

**Atau terpisah:**

```bash
npm run dev:fe   # frontend → http://localhost:5173
npm run dev:be   # backend  → http://localhost:3001
```

---

## Akun default (setelah seed)

| Role      | Username | Password |
| --------- | -------- | -------- |
| Admin     | admin    | admin123 |
| Mahasiswa | rizka    | rizka123 |
| Mahasiswa | bima     | bima123  |
| Mahasiswa | dina     | dina123  |

---

## API Endpoints

| Method | Path                    | Auth       | Keterangan             |
| ------ | ----------------------- | ---------- | ---------------------- |
| POST   | /api/auth/login         | -          | Login, dapat JWT token |
| POST   | /api/auth/logout        | User       | Logout                 |
| GET    | /api/auth/me            | User       | Info user aktif        |
| GET    | /api/users              | Admin      | Daftar semua user      |
| POST   | /api/users              | Admin      | Buat akun baru         |
| DELETE | /api/users/:id          | Admin      | Hapus akun             |
| PATCH  | /api/users/:id/password | User/Admin | Ganti password         |
| GET    | /api/kelas              | User       | Info kelas + statistik |
| GET    | /api/kelas/matkul       | User       | Daftar mata kuliah     |
| GET    | /api/pengumuman         | User       | Daftar pengumuman      |
| POST   | /api/pengumuman         | Admin      | Buat pengumuman        |
| DELETE | /api/pengumuman/:id     | Admin      | Hapus pengumuman       |
| GET    | /api/tugas              | User       | Daftar tugas           |
| POST   | /api/tugas              | Admin      | Buat tugas             |
| PATCH  | /api/tugas/:id          | Admin      | Update tugas           |
| DELETE | /api/tugas/:id          | Admin      | Hapus tugas            |
| GET    | /api/materi             | User       | Daftar materi          |
| POST   | /api/materi             | Admin      | Upload materi          |
| DELETE | /api/materi/:id         | Admin      | Hapus materi           |
| GET    | /api/jadwal             | User       | Jadwal mingguan        |
| GET    | /api/absensi            | User       | Rekap absensi          |
| POST   | /api/absensi            | Admin      | Buat sesi absensi      |
| POST   | /api/absensi/:id/detail | Admin      | Input hadir/izin/alpha |

---

## Prisma commands

```bash
cd backend

npm run db:push      # sync schema ke DB (development)
npm run db:migrate   # buat migration file (production)
npm run db:studio    # buka Prisma Studio (GUI database)
npm run db:seed      # isi ulang data awal
```
