import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const VALID_LABEL = ['penting', 'info', 'jadwal'];

// GET /api/pengumuman
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  // kelasId diambil dari user yang login, bukan dari query string
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const data = await prisma.pengumuman.findMany({
    where: { kelasId },
    include: { author: { select: { nama: true, inisial: true, color: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return ok(res, data);
}));

// POST /api/pengumuman
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { judul, isi, label } = req.body;
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';

  if (!judul || !isi) return fail(res, 'Judul dan isi wajib diisi.');
  if (label && !VALID_LABEL.includes(label)) return fail(res, `Label tidak valid. Pilihan: ${VALID_LABEL.join(', ')}`);

  const data = await prisma.pengumuman.create({
    data: { judul: judul.trim(), isi: isi.trim(), label: label ?? 'info', kelasId, authorId: req.user.id },
    include: { author: { select: { nama: true, inisial: true, color: true } } },
  });
  return ok(res, data, 201);
}));

// PATCH /api/pengumuman/:id
router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { judul, isi, label } = req.body;

  if (label && !VALID_LABEL.includes(label)) return fail(res, `Label tidak valid. Pilihan: ${VALID_LABEL.join(', ')}`);

  const item = await prisma.pengumuman.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tidak ditemukan.', 404);

  const data = await prisma.pengumuman.update({
    where: { id: req.params.id },
    data: {
      ...(judul ? { judul: judul.trim() } : {}),
      ...(isi   ? { isi: isi.trim() }     : {}),
      ...(label ? { label }               : {}),
    },
    include: { author: { select: { nama: true, inisial: true, color: true } } },
  });
  return ok(res, data);
}));

// DELETE /api/pengumuman/:id
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.pengumuman.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tidak ditemukan.', 404);
  await prisma.pengumuman.delete({ where: { id: req.params.id } });
  return ok(res, { message: 'Pengumuman dihapus.' });
}));

export default router;
