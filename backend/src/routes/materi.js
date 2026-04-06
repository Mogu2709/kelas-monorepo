import { Router }       from 'express';
import path             from 'path';
import fs               from 'fs';
import { fileURLToPath } from 'url';
import multer           from 'multer';
import prisma           from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ok, fail }     from '../lib/response.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.mp4', '.zip', '.drawio'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext    = path.extname(file.originalname);
    const base   = path.basename(file.originalname, ext)
                       .replace(/[^a-zA-Z0-9_\-]/g, '_')
                       .slice(0, 60);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXT.includes(ext)) return cb(null, true);
    cb(new Error(`Tipe file tidak didukung: ${ext}. Didukung: ${ALLOWED_EXT.join(', ')}`));
  },
});

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)       return `${bytes}B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)}MB`;
  return `${(bytes / 1073741824).toFixed(1)}GB`;
}

function detectTipe(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.pdf': 'PDF', '.pptx': 'PPTX', '.ppt': 'PPTX', '.docx': 'DOCX', '.doc': 'DOCX', '.mp4': 'MP4', '.zip': 'ZIP', '.drawio': 'DRAWIO' };
  return map[ext] ?? 'OTHER';
}

const VALID_TIPE = ['PDF', 'PPTX', 'MP4', 'DRAWIO', 'DOCX', 'ZIP', 'OTHER'];
const router = Router();

// GET /api/materi
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const kelasId = req.user.kelasId ?? 'kelas-if-2024-a';
  const data = await prisma.materi.findMany({
    where: { matkul: { kelasId } },
    include: { matkul: { select: { kode: true, nama: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return ok(res, data);
}));

// POST /api/materi — multipart (upload file) atau JSON (URL eksternal)
router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  const ct = req.headers['content-type'] ?? '';
  if (!ct.includes('multipart/form-data')) return next();
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return fail(res, 'Ukuran file melebihi batas 100MB.');
    if (err) return fail(res, err.message ?? 'Gagal upload file.');
    next();
  });
}, asyncHandler(async (req, res) => {
  const { nama, tipe, matkulId, url: bodyUrl } = req.body;
  const file = req.file;

  if (!matkulId) return fail(res, 'matkulId wajib diisi.');

  let finalNama   = (nama ?? '').trim();
  let finalTipe   = tipe ?? 'OTHER';
  let finalUkuran = '—';
  let finalUrl    = bodyUrl ?? null;

  if (file) {
    if (!finalNama) finalNama = path.basename(file.originalname, path.extname(file.originalname));
    finalTipe   = detectTipe(file.originalname);
    finalUkuran = formatBytes(file.size);
    finalUrl    = `/uploads/${file.filename}`;
  } else {
    if (!finalNama) return fail(res, 'nama wajib diisi.');
    if (tipe && !VALID_TIPE.includes(tipe)) return fail(res, `Tipe tidak valid.`);
  }

  const data = await prisma.materi.create({
    data: { nama: finalNama, tipe: finalTipe, ukuran: finalUkuran, url: finalUrl, matkulId },
    include: { matkul: { select: { kode: true, nama: true } } },
  });
  return ok(res, data, 201);
}));

// PATCH /api/materi/:id
router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { nama, tipe, ukuran, url } = req.body;
  if (tipe && !VALID_TIPE.includes(tipe)) return fail(res, `Tipe tidak valid.`);
  const item = await prisma.materi.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tidak ditemukan.', 404);
  const data = await prisma.materi.update({
    where: { id: req.params.id },
    data: {
      ...(nama   ? { nama: nama.trim() } : {}),
      ...(tipe   ? { tipe }              : {}),
      ...(ukuran ? { ukuran }            : {}),
      ...(url !== undefined ? { url }    : {}),
    },
    include: { matkul: { select: { kode: true, nama: true } } },
  });
  return ok(res, data);
}));

// DELETE /api/materi/:id
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.materi.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, 'Tidak ditemukan.', 404);
  if (item.url && item.url.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_DIR, path.basename(item.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await prisma.materi.delete({ where: { id: req.params.id } });
  return ok(res, { message: 'Materi dihapus.' });
}));

export default router;
