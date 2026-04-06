-- DropForeignKey
ALTER TABLE "absensi_detail" DROP CONSTRAINT "absensi_detail_userId_fkey";

-- DropForeignKey
ALTER TABLE "pengumuman" DROP CONSTRAINT "pengumuman_authorId_fkey";

-- DropEnum
DROP TYPE "StatusMahasiswa";

-- AddForeignKey
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_detail" ADD CONSTRAINT "absensi_detail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
