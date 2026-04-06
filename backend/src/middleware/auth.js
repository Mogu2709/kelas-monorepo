// src/middleware/auth.js
import { verifyToken } from '../lib/jwt.js';
import { fail } from '../lib/response.js';

// Wajib login
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 'Token tidak ditemukan.', 401);
  }

  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return fail(res, 'Token tidak valid atau sudah expired.', 401);
  }
}

// Wajib role admin
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return fail(res, 'Akses ditolak. Hanya admin yang bisa melakukan ini.', 403);
    }
    next();
  });
}
