import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const VALID_HARI = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

// GET /api/jadwal
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const data = await prisma.jadwal.findMany({
    where: { kelasId },
    include: { matkul: { select: { id: true, kode: true, nama: true, dosen: true } } },
    orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
  });
  return ok(res, data);
}));

// POST /api/jadwal
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { hari, jamMulai, jamSelesai, ruang, matkulId } = req.body;
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';

  if (!hari || !jamMulai || !jamSelesai || !ruang || !matkulId) {
    return fail(res, 'hari, jamMulai, jamSelesai, ruang, dan matkulId wajib diisi.');
  }

  // BUG FIX: validasi nilai hari agar tidak bisa diisi sembarang string
  if (!VALID_HARI.includes(hari.toLowerCase())) {
    return fail(res, `Hari tidak valid. Pilihan: ${VALID_HARI.join(', ')}.`);
  }

  const data = await prisma.jadwal.create({
    data: {
      hari: hari.toLowerCase(),
      jamMulai,
      jamSelesai,
      ruang: ruang.trim(),
      matkulId,
      kelasId,
    },
    include: { matkul: { select: { id: true, kode: true, nama: true, dosen: true } } },
  });
  return ok(res, data, 201);
}));

// DELETE /api/jadwal/:id
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.jadwal.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Jadwal tidak ditemukan.', 404);
  await prisma.jadwal.delete({ where: { id: req.params.id } });
  return ok(res, { message: 'Jadwal dihapus.' });
}));

export default router;
