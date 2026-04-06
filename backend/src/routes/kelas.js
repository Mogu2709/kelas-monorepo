import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ── GET /api/kelas ─────────────────────────────────────────────────────────
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const [kelas, totalMahasiswa, onlineCount] = await Promise.all([
    prisma.kelas.findFirst({ include: { mataKuliah: true } }),
    prisma.user.count({ where: { role: 'mahasiswa' } }),
    prisma.user.count({ where: { role: 'mahasiswa', status: 'online' } }),
  ]);
  return ok(res, { ...kelas, totalMahasiswa, onlineCount });
}));

// ── PATCH /api/kelas ── edit nama / prodi / vault kelas ───────────────────
router.patch('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { nama, prodi, vault } = req.body;
  const kelas = await prisma.kelas.findFirst();
  if (!kelas) return fail(res, 'Kelas tidak ditemukan', 404);

  const updated = await prisma.kelas.update({
    where: { id: kelas.id },
    data: {
      ...(nama  !== undefined && { nama }),
      ...(prodi !== undefined && { prodi }),
      ...(vault !== undefined && { vault }),
    },
  });
  return ok(res, updated);
}));

const mediaDir = path.join(process.cwd(), 'uploads', 'kelas');
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
 
const kelasStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, mediaDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const uploadMedia = multer({
  storage: kelasStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Hanya file gambar'));
    cb(null, true);
  },
});
 
// ── POST /api/kelas/banner ─────────────────────────────────────────────────
router.post('/banner', requireAuth, requireAdmin, uploadMedia.single('banner'), asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 'File tidak ada', 400);
 
  const kelas = await prisma.kelas.findFirst();
  if (!kelas) return fail(res, 'Kelas tidak ditemukan', 404);
 
  // Hapus banner lama
  if (kelas.bannerUrl) {
    const oldPath = path.join(process.cwd(), kelas.bannerUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
 
  const bannerUrl = `/uploads/kelas/${req.file.filename}`;
  const updated = await prisma.kelas.update({ where: { id: kelas.id }, data: { bannerUrl } });
  return ok(res, updated);
}));
 
// ── POST /api/kelas/icon ───────────────────────────────────────────────────
router.post('/icon', requireAuth, requireAdmin, uploadMedia.single('icon'), asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 'File tidak ada', 400);
 
  const kelas = await prisma.kelas.findFirst();
  if (!kelas) return fail(res, 'Kelas tidak ditemukan', 404);
 
  // Hapus icon lama
  if (kelas.iconUrl) {
    const oldPath = path.join(process.cwd(), kelas.iconUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
 
  const iconUrl = `/uploads/kelas/${req.file.filename}`;
  const updated = await prisma.kelas.update({ where: { id: kelas.id }, data: { iconUrl } });
  return ok(res, updated);
}));
 

// ── GET /api/kelas/matkul ─────────────────────────────────────────────────
router.get('/matkul', requireAuth, asyncHandler(async (req, res) => {
  const data = await prisma.mataKuliah.findMany({ orderBy: { nama: 'asc' } });
  return ok(res, data);
}));

// ── POST /api/kelas/matkul ── tambah matkul ───────────────────────────────
router.post('/matkul', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { kode, nama, dosen, sks } = req.body;
  if (!kode || !nama || !dosen) return fail(res, 'kode, nama, dosen wajib diisi', 400);

  const kelas = await prisma.kelas.findFirst();
  if (!kelas) return fail(res, 'Kelas belum ada', 404);

  const exists = await prisma.mataKuliah.findFirst({ where: { kode, kelasId: kelas.id } });
  if (exists) return fail(res, `Kode matkul "${kode}" sudah ada`, 409);

  const matkul = await prisma.mataKuliah.create({
    data: { kode, nama, dosen, kelasId: kelas.id, sks: sks ? parseInt(sks) : 3 },
  });
  return ok(res, matkul, 201);
}));

// ── PATCH /api/kelas/matkul/:id ── edit matkul ────────────────────────────
router.patch('/matkul/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { kode, nama, dosen } = req.body;

  const matkul = await prisma.mataKuliah.findUnique({ where: { id } });
  if (!matkul) return fail(res, 'Matkul tidak ditemukan', 404);

  const updated = await prisma.mataKuliah.update({
    where: { id },
    data: {
      ...(kode  !== undefined && { kode }),
      ...(nama  !== undefined && { nama }),
      ...(dosen !== undefined && { dosen }),
    },
  });
  return ok(res, updated);
}));

// ── DELETE /api/kelas/matkul/:id ── hapus matkul ──────────────────────────
router.delete('/matkul/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const matkul = await prisma.mataKuliah.findUnique({ where: { id } });
  if (!matkul) return fail(res, 'Matkul tidak ditemukan', 404);

  // Cek apakah ada data terkait yang masih aktif
  const [tugasCount, materiCount, jadwalCount, absensiCount] = await Promise.all([
    prisma.tugas.count({ where: { matkulId: id } }),
    prisma.materi.count({ where: { matkulId: id } }),
    prisma.jadwal.count({ where: { matkulId: id } }),
    prisma.absensi.count({ where: { matkulId: id } }),
  ]);

  const total = tugasCount + materiCount + jadwalCount + absensiCount;
  if (total > 0) {
    return fail(res,
      `Tidak bisa hapus — matkul masih punya ${tugasCount} tugas, ${materiCount} materi, ${jadwalCount} jadwal, ${absensiCount} absensi.`,
      409
    );
  }

  await prisma.mataKuliah.delete({ where: { id } });
  return ok(res, { id });
}));

export default router;