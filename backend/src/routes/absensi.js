import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const VALID_STATUS_ABSENSI = ['hadir', 'izin', 'alpha'];

// GET /api/absensi
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const data = await prisma.absensi.findMany({
    where: { kelasId },
    include: {
      matkul: { select: { kode: true, nama: true } },
      detail: { include: { user: { select: { id: true, nama: true, nim: true } } } },
    },
    orderBy: { tanggal: 'desc' },
    take: 100,
  });

  const result = data.map(a => {
    const hadir = a.detail.filter(d => d.status === 'hadir').length;
    const izin  = a.detail.filter(d => d.status === 'izin').length;
    const alpha = a.detail.filter(d => d.status === 'alpha').length;
    return { ...a, hadir, izin, alpha };
  });

  return ok(res, result);
}));

// POST /api/absensi
router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { tanggal, matkulId, total = 32 } = req.body;
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';

  if (!tanggal || !matkulId) return fail(res, 'tanggal dan matkulId wajib diisi.');

  const data = await prisma.absensi.create({
    data: { tanggal: new Date(tanggal), matkulId, kelasId, total },
    include: { matkul: { select: { kode: true, nama: true } } },
  });
  return ok(res, data, 201);
}));

// POST /api/absensi/:id/detail
router.post('/:id/detail', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { entries } = req.body;

  if (!Array.isArray(entries) || !entries.length) {
    return fail(res, 'entries harus array [{ userId, status }].');
  }

  // Validasi semua status sebelum upsert
  const invalid = entries.find(e => !VALID_STATUS_ABSENSI.includes(e.status));
  if (invalid) {
    return fail(res, `Status "${invalid.status}" tidak valid. Pilihan: ${VALID_STATUS_ABSENSI.join(', ')}`);
  }

  const results = await Promise.all(
    entries.map(e =>
      prisma.absensiDetail.upsert({
        where: { absensiId_userId: { absensiId: id, userId: e.userId } },
        update: { status: e.status },
        create: { absensiId: id, userId: e.userId, status: e.status },
      })
    )
  );

  return ok(res, results);
}));


// DELETE /api/absensi/:id
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sesi = await prisma.absensi.findUnique({ where: { id } });
  if (!sesi) return fail(res, 'Sesi absensi tidak ditemukan.', 404);

  // Hapus detail dulu (FK constraint), lalu hapus sesi
  await prisma.$transaction([
    prisma.absensiDetail.deleteMany({ where: { absensiId: id } }),
    prisma.absensi.delete({ where: { id } }),
  ]);
  return ok(res, { id });
}));

export default router;