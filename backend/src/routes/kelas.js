import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// GET /api/kelas
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  // Jalankan 3 query paralel — lebih cepat dari sequential
  const [kelas, totalMahasiswa, onlineCount] = await Promise.all([
    prisma.kelas.findFirst({ include: { mataKuliah: true } }),
    prisma.user.count({ where: { role: 'mahasiswa' } }),
    prisma.user.count({ where: { role: 'mahasiswa', status: 'online' } }),
  ]);

  return ok(res, { ...kelas, totalMahasiswa, onlineCount });
}));

// GET /api/kelas/matkul
router.get('/matkul', requireAuth, asyncHandler(async (req, res) => {
  const data = await prisma.mataKuliah.findMany({
    orderBy: { nama: 'asc' },
  });
  return ok(res, data);
}));

export default router;
