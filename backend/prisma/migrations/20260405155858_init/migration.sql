-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'mahasiswa');

-- CreateEnum
CREATE TYPE "StatusMahasiswa" AS ENUM ('aktif', 'perhatian', 'rendah');

-- CreateEnum
CREATE TYPE "StatusTugas" AS ENUM ('baru', 'aktif', 'urgent', 'selesai');

-- CreateEnum
CREATE TYPE "LabelPengumuman" AS ENUM ('penting', 'info', 'jadwal');

-- CreateEnum
CREATE TYPE "TipeMateri" AS ENUM ('PDF', 'PPTX', 'MP4', 'DRAWIO', 'DOCX', 'ZIP', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "inisial" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7c5cbf',
    "role" "Role" NOT NULL DEFAULT 'mahasiswa',
    "nim" TEXT,
    "tag" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "vault" TEXT NOT NULL,
    "totalMahasiswa" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "dosen" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumuman" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "label" "LabelPengumuman" NOT NULL DEFAULT 'info',
    "kelasId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "StatusTugas" NOT NULL DEFAULT 'baru',
    "terkumpul" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 32,
    "kelasId" TEXT NOT NULL,
    "matkulId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeMateri" NOT NULL DEFAULT 'PDF',
    "ukuran" TEXT NOT NULL,
    "url" TEXT,
    "baru" BOOLEAN NOT NULL DEFAULT true,
    "matkulId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "ruang" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "matkulId" TEXT NOT NULL,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kelasId" TEXT NOT NULL,
    "matkulId" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 32,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_detail" (
    "id" TEXT NOT NULL,
    "absensiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "absensi_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_nim_key" ON "users"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_detail_absensiId_userId_key" ON "absensi_detail"("absensiId", "userId");

-- AddForeignKey
ALTER TABLE "mata_kuliah" ADD CONSTRAINT "mata_kuliah_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi" ADD CONSTRAINT "materi_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_detail" ADD CONSTRAINT "absensi_detail_absensiId_fkey" FOREIGN KEY ("absensiId") REFERENCES "absensi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_detail" ADD CONSTRAINT "absensi_detail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
