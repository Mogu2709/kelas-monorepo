/*
  Warnings:

  - You are about to drop the column `totalMahasiswa` on the `kelas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kelas" DROP COLUMN "totalMahasiswa",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "iconUrl" TEXT;

-- AlterTable
ALTER TABLE "mata_kuliah" ADD COLUMN     "sks" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT;
