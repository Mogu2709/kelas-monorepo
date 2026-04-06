// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

function getToken() {
  try {
    const session = localStorage.getItem('kelas_session');
    return session ? JSON.parse(session).token : null;
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json();

  if (!json.ok) {
    const err = new Error(json.error ?? 'Request gagal.');
    err.status = res.status;
    throw err;
  }

  return json.data;
}

async function upload(path, formData, method = 'POST') {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json = await res.json();
  if (!json.ok) {
    const err = new Error(json.error ?? 'Upload gagal.');
    err.status = res.status;
    throw err;
  }
  return json.data;
}

const get   = (path)        => request('GET',    path);
const post  = (path, body)  => request('POST',   path, body);
const patch = (path, body)  => request('PATCH',  path, body);
const del   = (path)        => request('DELETE', path);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (username, password) => post('/auth/login', { username, password }),
  logout: ()                   => post('/auth/logout'),
  me:     ()                   => get('/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:           ()                   => get('/users'),
  create:         (data)               => post('/users', data),
  remove:         (id)                 => del(`/users/${id}`),
  changePassword: (id, password)       => patch(`/users/${id}/password`, { password }),
};

// ── Kelas ─────────────────────────────────────────────────────────────────────
export const kelasApi = {
  info:        ()           => get('/kelas'),
  update:      (data)       => patch('/kelas', data),
  uploadBanner:(formData)   => upload('/kelas/banner', formData),
  uploadIcon:  (formData)   => upload('/kelas/icon', formData),
  matkul:      ()           => get('/kelas/matkul'),
};

// ── Matkul ────────────────────────────────────────────────────────────────────
export const matkulApi = {
  list:   ()           => get('/kelas/matkul'),
  create: (data)       => post('/kelas/matkul', data),
  update: (id, data)   => patch(`/kelas/matkul/${id}`, data),
  remove: (id)         => del(`/kelas/matkul/${id}`),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  update:       (id, data)     => patch(`/users/${id}/profile`, data),
  uploadAvatar: (id, formData) => upload(`/users/${id}/avatar`, formData),
  changePassword:(id, password)=> patch(`/users/${id}/password`, { password }),
};

// ── Pengumuman ────────────────────────────────────────────────────────────────
export const pengumumanApi = {
  list:   ()           => get('/pengumuman'),
  create: (data)       => post('/pengumuman', data),
  update: (id, data)   => patch(`/pengumuman/${id}`, data),
  remove: (id)         => del(`/pengumuman/${id}`),
};

// ── Tugas ─────────────────────────────────────────────────────────────────────
export const tugasApi = {
  list:   (params = {}) => get(`/tugas${toQuery(params)}`),
  create: (data)         => post('/tugas', data),
  update: (id, data)     => patch(`/tugas/${id}`, data),
  remove: (id)           => del(`/tugas/${id}`),
};

// ── Materi ────────────────────────────────────────────────────────────────────
export const materiApi = {
  list:       ()           => get('/materi'),
  uploadFile: (formData)   => upload('/materi', formData),
  createUrl:  (data)       => post('/materi', data),
  update:     (id, data)   => patch(`/materi/${id}`, data),
  remove:     (id)         => del(`/materi/${id}`),
};

// ── Jadwal ────────────────────────────────────────────────────────────────────
export const jadwalApi = {
  list:   () => get('/jadwal'),
  create: (data) => post('/jadwal', data),
  remove: (id)   => del(`/jadwal/${id}`),
};

// ── Absensi ───────────────────────────────────────────────────────────────────
export const absensiApi = {
  list:        ()             => get('/absensi'),
  create:      (data)         => post('/absensi', data),
  inputDetail: (id, entries)  => post(`/absensi/${id}/detail`, { entries }),
  remove:      (id)           => del(`/absensi/${id}`),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  list:   (params = {}) => get(`/chat${toQuery(params)}`),
  send:   (isi)          => post('/chat', { isi }),
  remove: (id)           => del(`/chat/${id}`),
};

// ── Helper ────────────────────────────────────────────────────────────────────
function toQuery(params) {
  const q = new URLSearchParams(params).toString();
  return q ? `?${q}` : '';
}