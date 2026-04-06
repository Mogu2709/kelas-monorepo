import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const VALID_STATUS = ['baru', 'aktif', 'urgent', 'selesai'];

// GET /api/tugas
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const { status } = req.query;

  if (status && !VALID_STATUS.includes(status)) {
    return fail(res, `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`);
  }

  const data = await prisma.tugas.findMany({
    where: {
      kelasId,
      ...(status ? { status } : {}),
    },
    include: { matkul: { select: { kode: true, nama: true } } },
    orderBy: { deadline: 'asc' },
  });
  return ok(res, data);
}));

// POST /api/tugas
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { judul, deskripsi, deadline, matkulId, total } = req.body;
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';

  if (!judul || !deadline || !matkulId) {
    return fail(res, 'judul, deadline, dan matkulId wajib diisi.');
  }

  const data = await prisma.tugas.create({
    data: {
      judul: judul.trim(),
      deskripsi: deskripsi?.trim(),
      deadline: new Date(deadline),
      matkulId, kelasId,
      total: total ?? 32,
    },
    include: { matkul: { select: { kode: true, nama: true } } },
  });
  return ok(res, data, 201);
}));

// PATCH /api/tugas/:id
router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { judul, deskripsi, deadline, status, terkumpul } = req.body;

  if (status && !VALID_STATUS.includes(status)) {
    return fail(res, `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`);
  }

  const item = await prisma.tugas.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tugas tidak ditemukan.', 404);

  const data = await prisma.tugas.update({
    where: { id: req.params.id },
    data: {
      ...(judul      ? { judul: judul.trim() }        : {}),
      ...(deskripsi  ? { deskripsi: deskripsi.trim() } : {}),
      ...(deadline   ? { deadline: new Date(deadline) } : {}),
      ...(status     ? { status }                      : {}),
      ...(terkumpul !== undefined ? { terkumpul }      : {}),
    },
    include: { matkul: { select: { kode: true, nama: true } } },
  });
  return ok(res, data);
}));

// DELETE /api/tugas/:id
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.tugas.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tidak ditemukan.', 404);
  await prisma.tugas.delete({ where: { id: req.params.id } });
  return ok(res, { message: 'Tugas dihapus.' });
}));

export default router;
