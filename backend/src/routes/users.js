import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ── Multer setup untuk avatar upload ─────────────────────────────────────
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Hanya file gambar'));
    cb(null, true);
  },
});

// ── GET /api/users ── list semua user (admin only) ────────────────────────
router.get('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, username: true, nama: true, inisial: true,
      color: true, role: true, nim: true, tag: true,
      status: true, avatarUrl: true, createdAt: true,
    },
  });
  return ok(res, users);
}));

// ── POST /api/users ── buat user baru (admin only) ────────────────────────
router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { username, password, nama, inisial, color, role, nim, tag } = req.body;
  if (!username || !password || !nama || !inisial || !tag) {
    return fail(res, 'Field wajib: username, password, nama, inisial, tag', 400);
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return fail(res, 'Username sudah dipakai', 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username, password: hashed, nama, inisial,
      color: color ?? '#7c5cbf',
      role:  role  ?? 'mahasiswa',
      nim:   nim   ?? null,
      tag,
    },
    select: {
      id: true, username: true, nama: true, inisial: true,
      color: true, role: true, nim: true, tag: true, status: true,
    },
  });
  return ok(res, user, 201);
}));

// ── DELETE /api/users/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return fail(res, 'User tidak ditemukan', 404);

  // Hapus data terkait sebelum hapus user (hindari FK constraint)
  await prisma.$transaction([
    prisma.absensiDetail.deleteMany({ where: { userId: id } }),
    prisma.message.deleteMany({ where: { authorId: id } }),
    prisma.pengumuman.deleteMany({ where: { authorId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  // Hapus avatar jika ada
  if (user.avatarUrl) {
    const filePath = path.join(process.cwd(), user.avatarUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return ok(res, { id });
}));

// ── PATCH /api/users/:id/password ─────────────────────────────────────────
router.patch('/:id/password', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  // User hanya bisa ganti password sendiri, kecuali admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return fail(res, 'Tidak diizinkan', 403);
  }
  const { password } = req.body;
  if (!password || password.length < 6) return fail(res, 'Password minimal 6 karakter', 400);

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return ok(res, { message: 'Password berhasil diubah' });
}));

// ── PATCH /api/users/:id/profile ── edit profil ───────────────────────────
router.patch('/:id/profile', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id && req.user.role !== 'admin') {
    return fail(res, 'Tidak diizinkan', 403);
  }

  const { nama, inisial, color, tag, nim } = req.body;
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(nama    !== undefined && { nama }),
      ...(inisial !== undefined && { inisial }),
      ...(color   !== undefined && { color }),
      ...(tag     !== undefined && { tag }),
      ...(nim     !== undefined && { nim }),
    },
    select: {
      id: true, username: true, nama: true, inisial: true,
      color: true, role: true, nim: true, tag: true,
      status: true, avatarUrl: true,
    },
  });
  return ok(res, updated);
}));

// ── POST /api/users/:id/avatar ── upload foto profil ──────────────────────
router.post('/:id/avatar', requireAuth, uploadAvatar.single('avatar'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id && req.user.role !== 'admin') {
    return fail(res, 'Tidak diizinkan', 403);
  }
  if (!req.file) return fail(res, 'File tidak ada', 400);

  // Hapus avatar lama jika ada
  const existing = await prisma.user.findUnique({ where: { id }, select: { avatarUrl: true } });
  if (existing?.avatarUrl) {
    const oldPath = path.join(process.cwd(), existing.avatarUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const updated = await prisma.user.update({
    where: { id },
    data: { avatarUrl },
    select: { id: true, avatarUrl: true },
  });
  return ok(res, updated);
}));

export default router;