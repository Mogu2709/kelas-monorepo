import 'dotenv/config';
import express          from 'express';
import cors             from 'cors';
import path             from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Validasi env wajib ────────────────────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] ERROR: env variable "${key}" wajib diisi. Cek file .env`);
    process.exit(1);
  }
}

import authRoutes       from './routes/auth.js';
import usersRoutes      from './routes/users.js';
import kelasRoutes      from './routes/kelas.js';
import pengumumanRoutes from './routes/pengumuman.js';
import tugasRoutes      from './routes/tugas.js';
import materiRoutes     from './routes/materi.js';
import jadwalRoutes     from './routes/jadwal.js';
import absensiRoutes    from './routes/absensi.js';
import chatRoutes       from './routes/chat.js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Serve file upload — mahasiswa bisa download langsung via URL
const UPLOAD_DIR = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/kelas',      kelasRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/tugas',      tugasRoutes);
app.use('/api/materi',     materiRoutes);
app.use('/api/jadwal',     jadwalRoutes);
app.use('/api/absensi',    absensiRoutes);
app.use('/api/chat',       chatRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ ok: false, error: `Route ${req.path} tidak ditemukan.` }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err.message ?? err);

  if (err.code === 'P2002') return res.status(409).json({ ok: false, error: 'Data sudah ada (duplikat).' });
  if (err.code === 'P2025') return res.status(404).json({ ok: false, error: 'Data tidak ditemukan.' });

  res.status(500).json({ ok: false, error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
});
