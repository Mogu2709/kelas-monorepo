export const kelasInfo = {
  nama: 'IF-2024-A',
  prodi: 'Teknik Informatika',
  vault: 'kelas-teknik-informatika',
  totalMahasiswa: 32,
  onlineCount: 4,
};

export const users = {
  admin: {
    id: 'admin-1',
    nama: 'Ahmad Ketua',
    nim: null,
    inisial: 'AK',
    tag: '#ketua',
    role: 'admin',
    color: '#7c5cbf',
    status: 'online',
  },
  mahasiswa: {
    id: 'mhs-1',
    nama: 'Rizka Hana',
    nim: '2024001',
    inisial: 'RH',
    tag: '#2024001',
    role: 'mahasiswa',
    color: '#4ecdc4',
    status: 'idle',
  },
};

export const mahasiswaList = [
  { id: 1, nama: 'Rizka Hana',     nim: '2024001', inisial: 'RH', color: '#7c5cbf', absensi: 95, tugas: '4/4', status: 'aktif' },
  { id: 2, nama: 'Bima Pratama',   nim: '2024002', inisial: 'BP', color: '#4ecdc4', absensi: 88, tugas: '3/4', status: 'aktif' },
  { id: 3, nama: 'Dina Fitri',     nim: '2024003', inisial: 'DF', color: '#faa61a', absensi: 72, tugas: '2/4', status: 'perhatian' },
  { id: 4, nama: 'Muhammad Aldi',  nim: '2024004', inisial: 'MA', color: '#f04747', absensi: 61, tugas: '1/4', status: 'rendah' },
  { id: 5, nama: 'Siti Khadijah',  nim: '2024005', inisial: 'SK', color: '#5865f2', absensi: 97, tugas: '4/4', status: 'aktif' },
  { id: 6, nama: 'Yoga Perdana',   nim: '2024006', inisial: 'YP', color: '#43b581', absensi: 84, tugas: '3/4', status: 'aktif' },
];

export const pengumumanList = [
  {
    id: 1,
    judul: 'UTS Algoritma diundur ke 14 April 2026',
    isi: 'UTS yang semula dijadwalkan 12 April diundur menjadi 14 April 2026. Materi yang diujikan tetap sama seperti yang sudah disampaikan di kelas.',
    penulis: 'Pak Budi Santoso',
    inisial: 'BP',
    color: '#7c5cbf',
    tanggal: '4 Apr 2026',
    label: 'penting',
  },
  {
    id: 2,
    judul: 'Pengumpulan tugas Basis Data diperpanjang',
    isi: 'Deadline ER Diagram Toko Online diperpanjang ke 10 April 2026 pukul 23.59 WIB. Kumpul via Google Drive kelas.',
    penulis: 'Ahmad Ketua',
    inisial: 'AK',
    color: '#5865f2',
    tanggal: '3 Apr 2026',
    label: 'info',
  },
  {
    id: 3,
    judul: 'Kuliah tamu diganti ke Zoom',
    isi: 'Kuliah tamu "AI dalam Industri" pada 11 April dilaksanakan via Zoom. Link dibagikan H-1 via grup WA kelas.',
    penulis: 'Pak Budi Santoso',
    inisial: 'BP',
    color: '#4ecdc4',
    tanggal: '2 Apr 2026',
    label: 'jadwal',
  },
];

export const tugasList = [
  { id: 1, judul: 'Laporan Praktikum Jarkom #3', matkul: 'jarkom',      deadline: '2026-04-07', terkumpul: 18, total: 32, status: 'urgent' },
  { id: 2, judul: 'ER Diagram Toko Online',       matkul: 'basis-data', deadline: '2026-04-10', terkumpul: 24, total: 32, status: 'aktif' },
  { id: 3, judul: 'Quiz Algoritma Bab 5',         matkul: 'algoritma',  deadline: '2026-04-14', terkumpul: 10, total: 32, status: 'baru' },
  { id: 4, judul: 'Paper Keamanan Jaringan',      matkul: 'jarkom',     deadline: '2026-04-20', terkumpul: 3,  total: 32, status: 'baru' },
];

export const tugasSelesai = [
  { id: 5, judul: 'Tugas 1 Algoritma',          matkul: 'algoritma',  deadline: '2026-03-20', terkumpul: 32, total: 32, status: 'selesai' },
  { id: 6, judul: 'UTS Basis Data take-home',   matkul: 'basis-data', deadline: '2026-03-25', terkumpul: 31, total: 32, status: 'selesai' },
];

export const materiList = {
  algoritma: [
    { id: 1, nama: 'Modul 1 — Pengenalan',   tipe: 'PDF',   ukuran: '2.1MB', baru: false },
    { id: 2, nama: 'Modul 5 — Rekursi',      tipe: 'PDF',   ukuran: '3.4MB', baru: false },
    { id: 3, nama: 'Slide Pertemuan 8',       tipe: 'PPTX',  ukuran: '5.7MB', baru: true  },
  ],
  'basis-data': [
    { id: 4, nama: 'Modul 1 — Intro SQL',    tipe: 'PDF',    ukuran: '1.8MB', baru: false },
    { id: 5, nama: 'Video: Normalisasi',      tipe: 'MP4',   ukuran: '45MB',  baru: true  },
    { id: 6, nama: 'Template ER Diagram',     tipe: 'DRAWIO', ukuran: '120KB', baru: false },
  ],
  'jaringan-komputer': [
    { id: 7, nama: 'Modul 3 — TCP/IP',       tipe: 'PDF',   ukuran: '4.2MB', baru: true  },
    { id: 8, nama: 'Slide Routing Protokol', tipe: 'PPTX',  ukuran: '8.1MB', baru: false },
  ],
  'matematika-diskrit': [
    { id: 9,  nama: 'Modul 4 — Graf',         tipe: 'PDF',  ukuran: '2.9MB', baru: false },
    { id: 10, nama: 'Video: Logika Proposisi', tipe: 'MP4',  ukuran: '32MB',  baru: false },
  ],
};

export const jadwalList = {
  senin: [
    { jam: '07.30–09.10', nama: 'Algoritma & Pemrograman', ruang: 'C-301',    dosen: 'Pak Budi',  accent: '#7c5cbf' },
    { jam: '13.00–14.40', nama: 'Basis Data',              ruang: 'Lab DB-1', dosen: 'Bu Sari',   accent: '#4ecdc4' },
  ],
  selasa: [
    { jam: '09.20–11.00', nama: 'Matematika Diskrit',      ruang: 'B-201',    dosen: 'Pak Eko',   accent: '#5865f2' },
  ],
  rabu: [
    { jam: '07.30–10.00', nama: 'Praktikum Jarkom',        ruang: 'Lab Jarkom', dosen: 'Bu Rani', accent: '#faa61a' },
  ],
  kamis: [
    { jam: '13.00–14.40', nama: 'Jaringan Komputer',       ruang: 'C-201',    dosen: 'Bu Rani',   accent: '#43b581' },
    { jam: '15.00–16.40', nama: 'Basis Data (asistensi)',  ruang: 'Lab DB-1', dosen: 'Ahmad',     accent: '#4ecdc4' },
  ],
};

export const absensiList = [
  { tanggal: '2026-03-31', matkul: 'algoritma',    hadir: 29, izin: 2, alpha: 1, total: 32 },
  { tanggal: '2026-04-01', matkul: 'basis-data',   hadir: 30, izin: 1, alpha: 1, total: 32 },
  { tanggal: '2026-04-02', matkul: 'jarkom',       hadir: 28, izin: 3, alpha: 1, total: 32 },
  { tanggal: '2026-04-03', matkul: 'mat-diskrit',  hadir: 31, izin: 1, alpha: 0, total: 32 },
];

export const channels = [
  { group: 'overview',  items: [
    { id: 'dashboard',    label: 'dashboard',     notif: false, adminOnly: false },
    { id: 'pengumuman',   label: 'pengumuman',    notif: true,  adminOnly: false },
  ]},
  { group: 'akademik',  items: [
    { id: 'tugas',        label: 'tugas',         notif: false, adminOnly: false },
    { id: 'materi',       label: 'materi-modul',  notif: false, adminOnly: false },
    { id: 'jadwal',       label: 'jadwal',        notif: false, adminOnly: false },
    { id: 'absensi',      label: 'absensi',       notif: false, adminOnly: false },
  ]},
  { group: 'admin',     items: [
    { id: 'mahasiswa',    label: 'mahasiswa',     notif: false, adminOnly: true  },
  ]},
];
