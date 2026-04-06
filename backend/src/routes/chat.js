import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// GET /api/chat?limit=50&before=<id>
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const limit   = Math.min(Number(req.query.limit ?? 50), 100);
  const before  = req.query.before;

  const messages = await prisma.message.findMany({
    where: {
      kelasId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: {
      author: { select: { id: true, nama: true, inisial: true, color: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return ok(res, messages.reverse());
}));

// POST /api/chat
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { isi } = req.body;
  if (!isi || !isi.trim()) return fail(res, 'Pesan tidak boleh kosong.');
  if (isi.trim().length > 2000) return fail(res, 'Pesan terlalu panjang (maks 2000 karakter).');

  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';

  const msg = await prisma.message.create({
    data: { isi: isi.trim(), kelasId, authorId: req.user.id },
    include: {
      author: { select: { id: true, nama: true, inisial: true, color: true, role: true } },
    },
  });

  return ok(res, msg, 201);
}));

// DELETE /api/chat/:id
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const msg = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!msg) return fail(res, 'Pesan tidak ditemukan.', 404);

  const isOwner = msg.authorId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return fail(res, 'Tidak diizinkan.', 403);

  await prisma.message.delete({ where: { id: req.params.id } });
  return ok(res, { message: 'Pesan dihapus.' });
}));

export default router;
