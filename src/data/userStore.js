// ── userStore.js ─────────────────────────────────────────────────────────────
// Penyimpanan user menggunakan localStorage agar persisten.
// Admin default sudah ada sejak awal, tidak bisa dihapus.

const STORAGE_KEY = 'kelas_users';

const defaultUsers = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    nama: 'Ahmad Ketua',
    inisial: 'AK',
    color: '#7c5cbf',
    role: 'admin',
    nim: null,
    tag: '#ketua',
    status: 'online',
    createdAt: '2026-01-01',
  },
  {
    id: 'mhs-1',
    username: 'rizka',
    password: 'rizka123',
    nama: 'Rizka Hana',
    inisial: 'RH',
    color: '#4ecdc4',
    role: 'mahasiswa',
    nim: '2024001',
    tag: '#2024001',
    status: 'online',
    createdAt: '2026-01-10',
  },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Inisialisasi: jika belum ada data, pakai default
function init() {
  if (!load()) save(defaultUsers);
}

export function getUsers() {
  init();
  return load();
}

export function findByUsername(username) {
  return getUsers().find(u => u.username === username) ?? null;
}

export function authenticate(username, password) {
  const user = findByUsername(username);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export function createUser({ username, password, nama, nim, role }) {
  const users = getUsers();

  // Cek duplikat username
  if (users.find(u => u.username === username)) {
    return { ok: false, error: 'Username sudah dipakai.' };
  }

  // Cek duplikat NIM kalau mahasiswa
  if (role === 'mahasiswa' && nim && users.find(u => u.nim === nim)) {
    return { ok: false, error: 'NIM sudah terdaftar.' };
  }

  const inisial = nama
    .split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const colors = ['#7c5cbf', '#4ecdc4', '#5865f2', '#43b581', '#faa61a', '#f04747', '#e91e8c'];
  const color = colors[users.length % colors.length];

  const newUser = {
    id: `usr-${Date.now()}`,
    username,
    password,
    nama,
    inisial,
    color,
    role,
    nim: role === 'mahasiswa' ? nim : null,
    tag: role === 'mahasiswa' ? `#${nim}` : '#admin',
    status: 'offline',
    createdAt: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  save(users);
  return { ok: true, user: newUser };
}

export function deleteUser(id) {
  const users = getUsers().filter(u => u.id !== id);
  save(users);
}

export function resetStore() {
  save(defaultUsers);
}
