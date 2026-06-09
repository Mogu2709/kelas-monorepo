// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPass,
      nama: 'Ahmad Ketua',
      inisial: 'AK',
      color: '#7c5cbf',
      role: 'admin',
      tag: '#ketua',
      status: 'online',
    },
  });

  const mhsData = [
    { username: 'rizka',  nama: 'Rizka Hana',    nim: '2024001', color: '#4ecdc4', pass: 'rizka123' },
    { username: 'bima',   nama: 'Bima Pratama',   nim: '2024002', color: '#43b581', pass: 'bima123'  },
    { username: 'dina',   nama: 'Dina Fitri',     nim: '2024003', color: '#faa61a', pass: 'dina123'  },
    { username: 'aldi',   nama: 'Muhammad Aldi',  nim: '2024004', color: '#f04747', pass: 'aldi123'  },
    { username: 'siti',   nama: 'Siti Khadijah',  nim: '2024005', color: '#5865f2', pass: 'siti123'  },
    { username: 'yoga',   nama: 'Yoga Perdana',   nim: '2024006', color: '#43b581', pass: 'yoga123'  },
  ];

  const mhsUsers = [];
  for (const m of mhsData) {
    const hashed = await bcrypt.hash(m.pass, 10);
    const inisial = m.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const user = await prisma.user.upsert({
      where: { username: m.username },
      update: {},
      create: {
        username: m.username,
        password: hashed,
        nama: m.nama,
        inisial,
        color: m.color,
        role: 'mahasiswa',
        nim: m.nim,
        tag: `#${m.nim}`,
        status: 'offline',
      },
    });
    mhsUsers.push(user);
  }

  // ── Kelas ──────────────────────────────────────────────────────────────────
  const kelas = await prisma.kelas.upsert({
    where: { id: 'kelas-if-2024-a' },
    update: {},
    create: {
      id: 'kelas-if-2024-a',
      nama: 'IF-2024-A',
      prodi: 'Teknik Informatika',
      vault: 'kelas-teknik-informatika',
      totalMahasiswa: 32,
    },
  });

  // ── Mata Kuliah ────────────────────────────────────────────────────────────
  const matkulList = [
    { id: 'mk-algo',    kode: 'algoritma',    nama: 'Algoritma & Pemrograman', dosen: 'Pak Budi Santoso' },
    { id: 'mk-bd',      kode: 'basis-data',   nama: 'Basis Data',              dosen: 'Bu Sari Dewi'     },
    { id: 'mk-jarkom',  kode: 'jarkom',       nama: 'Jaringan Komputer',       dosen: 'Bu Rani Wulandari'},
    { id: 'mk-matdis',  kode: 'mat-diskrit',  nama: 'Matematika Diskrit',      dosen: 'Pak Eko Nugroho'  },
  ];

  const matkuls = {};
  for (const mk of matkulList) {
    const created = await prisma.mataKuliah.upsert({
      where: { id: mk.id },
      update: {},
      create: { ...mk, kelasId: kelas.id },
    });
    matkuls[mk.kode] = created;
  }

  // ── Pengumuman ─────────────────────────────────────────────────────────────
  await prisma.pengumuman.deleteMany({ where: { kelasId: kelas.id } });
  await prisma.pengumuman.createMany({
    data: [
      {
        judul: 'UTS Algoritma diundur ke 14 April 2026',
        isi: 'UTS yang semula dijadwalkan 12 April diundur menjadi 14 April 2026. Materi yang diujikan tetap sama seperti yang sudah disampaikan di kelas.',
        label: 'penting',
        kelasId: kelas.id,
        authorId: admin.id,
        createdAt: new Date('2026-04-04'),
      },
      {
        judul: 'Pengumpulan tugas Basis Data diperpanjang',
        isi: 'Deadline ER Diagram Toko Online diperpanjang ke 10 April 2026 pukul 23.59 WIB. Kumpul via Google Drive kelas.',
        label: 'info',
        kelasId: kelas.id,
        authorId: admin.id,
        createdAt: new Date('2026-04-03'),
      },
      {
        judul: 'Kuliah tamu diganti ke Zoom',
        isi: 'Kuliah tamu "AI dalam Industri" pada 11 April dilaksanakan via Zoom. Link dibagikan H-1 via grup WA kelas.',
        label: 'jadwal',
        kelasId: kelas.id,
        authorId: admin.id,
        createdAt: new Date('2026-04-02'),
      },
    ],
  });

  // ── Tugas ──────────────────────────────────────────────────────────────────
  await prisma.tugas.deleteMany({ where: { kelasId: kelas.id } });
  await prisma.tugas.createMany({
    data: [
      { judul: 'Laporan Praktikum Jarkom #3', deadline: new Date('2026-04-07'), terkumpul: 18, total: 32, status: 'urgent',  kelasId: kelas.id, matkulId: matkuls['jarkom'].id      },
      { judul: 'ER Diagram Toko Online',       deadline: new Date('2026-04-10'), terkumpul: 24, total: 32, status: 'aktif',   kelasId: kelas.id, matkulId: matkuls['basis-data'].id  },
      { judul: 'Quiz Algoritma Bab 5',         deadline: new Date('2026-04-14'), terkumpul: 10, total: 32, status: 'baru',    kelasId: kelas.id, matkulId: matkuls['algoritma'].id   },
      { judul: 'Paper Keamanan Jaringan',      deadline: new Date('2026-04-20'), terkumpul: 3,  total: 32, status: 'baru',    kelasId: kelas.id, matkulId: matkuls['jarkom'].id      },
      { judul: 'Tugas 1 Algoritma',            deadline: new Date('2026-03-20'), terkumpul: 32, total: 32, status: 'selesai', kelasId: kelas.id, matkulId: matkuls['algoritma'].id   },
      { judul: 'UTS Basis Data take-home',     deadline: new Date('2026-03-25'), terkumpul: 31, total: 32, status: 'selesai', kelasId: kelas.id, matkulId: matkuls['basis-data'].id  },
    ],
  });

  // ── Materi ─────────────────────────────────────────────────────────────────
  await prisma.materi.deleteMany({ where: { matkul: { kelasId: kelas.id } } });
  await prisma.materi.createMany({
    data: [
      { nama: 'Modul 1 — Pengenalan',    tipe: 'PDF',    ukuran: '2.1MB', baru: false, matkulId: matkuls['algoritma'].id   },
      { nama: 'Modul 5 — Rekursi',       tipe: 'PDF',    ukuran: '3.4MB', baru: false, matkulId: matkuls['algoritma'].id   },
      { nama: 'Slide Pertemuan 8',        tipe: 'PPTX',   ukuran: '5.7MB', baru: true,  matkulId: matkuls['algoritma'].id   },
      { nama: 'Modul 1 — Intro SQL',     tipe: 'PDF',    ukuran: '1.8MB', baru: false, matkulId: matkuls['basis-data'].id  },
      { nama: 'Video: Normalisasi',       tipe: 'MP4',    ukuran: '45MB',  baru: true,  matkulId: matkuls['basis-data'].id  },
      { nama: 'Template ER Diagram',      tipe: 'DRAWIO', ukuran: '120KB', baru: false, matkulId: matkuls['basis-data'].id  },
      { nama: 'Modul 3 — TCP/IP',        tipe: 'PDF',    ukuran: '4.2MB', baru: true,  matkulId: matkuls['jarkom'].id      },
      { nama: 'Slide Routing Protokol',   tipe: 'PPTX',   ukuran: '8.1MB', baru: false, matkulId: matkuls['jarkom'].id      },
      { nama: 'Modul 4 — Graf',          tipe: 'PDF',    ukuran: '2.9MB', baru: false, matkulId: matkuls['mat-diskrit'].id },
      { nama: 'Video: Logika Proposisi',  tipe: 'MP4',    ukuran: '32MB',  baru: false, matkulId: matkuls['mat-diskrit'].id },
    ],
  });

  // ── Jadwal ─────────────────────────────────────────────────────────────────
  await prisma.jadwal.deleteMany({ where: { kelasId: kelas.id } });
  await prisma.jadwal.createMany({
    data: [
      { hari: 'senin',  jamMulai: '07.30', jamSelesai: '09.10', ruang: 'C-301',     kelasId: kelas.id, matkulId: matkuls['algoritma'].id   },
      { hari: 'senin',  jamMulai: '13.00', jamSelesai: '14.40', ruang: 'Lab DB-1',  kelasId: kelas.id, matkulId: matkuls['basis-data'].id  },
      { hari: 'selasa', jamMulai: '09.20', jamSelesai: '11.00', ruang: 'B-201',     kelasId: kelas.id, matkulId: matkuls['mat-diskrit'].id },
      { hari: 'rabu',   jamMulai: '07.30', jamSelesai: '10.00', ruang: 'Lab Jarkom', kelasId: kelas.id, matkulId: matkuls['jarkom'].id     },
      { hari: 'kamis',  jamMulai: '13.00', jamSelesai: '14.40', ruang: 'C-201',     kelasId: kelas.id, matkulId: matkuls['jarkom'].id      },
    ],
  });

  // ── Absensi ────────────────────────────────────────────────────────────────
  await prisma.absensiDetail.deleteMany({});
  await prisma.absensi.deleteMany({ where: { kelasId: kelas.id } });

  const absensiRows = [
    { tanggal: new Date('2026-03-31'), matkulId: matkuls['algoritma'].id  },
    { tanggal: new Date('2026-04-01'), matkulId: matkuls['basis-data'].id },
    { tanggal: new Date('2026-04-02'), matkulId: matkuls['jarkom'].id     },
    { tanggal: new Date('2026-04-03'), matkulId: matkuls['mat-diskrit'].id},
  ];

  for (const row of absensiRows) {
    const absensi = await prisma.absensi.create({
      data: { tanggal: row.tanggal, kelasId: kelas.id, matkulId: row.matkulId, total: 32 },
    });
    // Seed absensi detail untuk 6 user sample
    const statuses = ['hadir', 'hadir', 'hadir', 'izin', 'hadir', 'hadir'];
    for (let i = 0; i < mhsUsers.length; i++) {
      await prisma.absensiDetail.create({
        data: { absensiId: absensi.id, userId: mhsUsers[i].id, status: statuses[i] },
      });
    }
  }

  console.log('✅ Seed selesai!');
  console.log('   Admin  → username: admin   | password: admin123');
  console.log('   Sample → username: rizka   | password: rizka123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
