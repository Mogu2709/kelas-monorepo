# kelas.id — Dashboard Kelas Universitas

Dashboard kelas bergaya Discord + Obsidian, dibangun dengan React + Vite.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

---

## Struktur folder

```
src/
├── components/
│   ├── layout/          # Shell UI
│   │   ├── ServerRail.jsx   — kolom ikon server (kiri)
│   │   ├── Sidebar.jsx      — channel list + user panel
│   │   ├── TopBar.jsx       — header atas
│   │   └── MessageBar.jsx   — input bar bawah
│   │
│   ├── sections/        # Isi tiap "channel"
│   │   ├── SectionDashboard.jsx
│   │   ├── SectionPengumuman.jsx
│   │   ├── SectionTugas.jsx
│   │   ├── SectionMateri.jsx
│   │   ├── SectionJadwal.jsx
│   │   ├── SectionAbsensi.jsx
│   │   └── SectionMahasiswa.jsx
│   │
│   └── ui/              # Komponen reusable
│       ├── Avatar.jsx
│       ├── Badge.jsx
│       ├── ObsCard.jsx
│       └── ProgressBar.jsx
│
├── context/
│   └── AppContext.jsx    — state global (role, activeChannel)
│
├── data/
│   └── index.js         — mock data (ganti dengan API call)
│
├── styles/
│   ├── global.css       — CSS variables + reset
│   └── components.css   — semua style komponen
│
├── App.jsx              — routing antar section
└── main.jsx             — entry point
```

---

## Sambungkan ke backend

Semua data ada di `src/data/index.js`. Ganti dengan fetch ke API:

```js
// src/hooks/useMahasiswa.js
import { useState, useEffect } from 'react';

export function useMahasiswa() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/mahasiswa')
      .then(r => r.json())
      .then(setData);
  }, []);
  return data;
}
```

## Tech stack

- React 18 + Vite
- react-router-dom
- lucide-react
- CSS murni (tanpa Tailwind)
