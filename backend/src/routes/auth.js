import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// Rate limit khusus login — maks 10 percobaan per 15 menit per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return fail(res, 'Username dan password wajib diisi.');
  }

  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase().trim() } });
  if (!user) return fail(res, 'Username atau password salah.', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return fail(res, 'Username atau password salah.', 401);

  await prisma.user.update({ where: { id: user.id }, data: { status: 'online' } });

  const token = signToken({ id: user.id, username: user.username, role: user.role });

  const { password: _, ...safeUser } = user;
  return ok(res, { token, user: { ...safeUser, status: 'online' } });
}));

// POST /api/auth/logout
router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { status: 'offline' } });
  return ok(res, { message: 'Logout berhasil.' });
}));

// GET /api/auth/me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, username: true, nama: true, inisial: true,
      color: true, role: true, nim: true, tag: true,
      status: true, avatarUrl: true, createdAt: true,
    },
  });
  if (!user) return fail(res, 'User tidak ditemukan.', 404);
  return ok(res, user);
}));

export default router;
