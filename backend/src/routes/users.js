import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { ok, fail } from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const safeSelect = {
  id: true, username: true, nama: true, inisial: true,
  color: true, role: true, nim: true, tag: true,
  status: true, createdAt: true,
};

// GET /api/users
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: safeSelect,
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });
  return ok(res, users);
}));

// POST /api/users
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { username, password, nama, nim, role } = req.body;

  if (!username || !password || !nama || !role)
    return fail(res, 'username, password, nama, dan role wajib diisi.');
  if (!['admin', 'mahasiswa'].includes(role))
    return fail(res, 'Role tidak valid.');
  if (role === 'mahasiswa' && !nim)
    return fail(res, 'NIM wajib diisi untuk role mahasiswa.');
  if (password.length < 6)
    return fail(res, 'Password minimal 6 karakter.');

  const existUser = await prisma.user.findUnique({ where: { username: username.toLowerCase().trim() } });
  if (existUser) return fail(res, 'Username sudah dipakai.');

  if (nim) {
    const existNim = await prisma.user.findUnique({ where: { nim: nim.trim() } });
    if (existNim) return fail(res, 'NIM sudah terdaftar.');
  }

  const inisial = nama.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const colors  = ['#7c5cbf', '#4ecdc4', '#5865f2', '#43b581', '#faa61a', '#f04747', '#e91e8c'];
  const count   = await prisma.user.count();
  const color   = colors[count % colors.length];
  const hashed  = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase().trim(),
      password: hashed,
      nama:     nama.trim(),
      inisial,
      color,
      role,
      nim:  nim?.trim() || null,
      tag:  role === 'mahasiswa' ? `#${nim.trim()}` : '#admin',
    },
    select: safeSelect,
  });

  return ok(res, user, 201);
}));

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id)
    return fail(res, 'Tidak bisa menghapus akun sendiri.');

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return fail(res, 'User tidak ditemukan.', 404);

  if (user.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) return fail(res, 'Minimal harus ada satu admin.');
  }

  // Hapus data terkait secara manual (defensive — kalau cascade belum aktif di DB lama)
  // Urutan: detail dulu baru parent, agar tidak FK violation
  await prisma.absensiDetail.deleteMany({ where: { userId: id } });
  await prisma.message.deleteMany({ where: { authorId: id } });
  // Pengumuman: hapus sekalian (author sudah tidak ada)
  await prisma.pengumuman.deleteMany({ where: { authorId: id } });

  await prisma.user.delete({ where: { id } });

  return ok(res, { message: 'Akun berhasil dihapus.' });
}));

// PATCH /api/users/:id/password
router.patch('/:id/password', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isOwner = req.user.id === id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin)
    return fail(res, 'Tidak punya akses untuk mengubah password user ini.', 403);

  const { password } = req.body;
  if (!password || password.length < 6)
    return fail(res, 'Password minimal 6 karakter.');

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return ok(res, { message: 'Password berhasil diubah.' });
}));

export default router;