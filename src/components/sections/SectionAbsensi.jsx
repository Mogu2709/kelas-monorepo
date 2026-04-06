import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import ProgressBar from '../ui/ProgressBar';
import { useApi, useMutation } from '../../hooks/useApi';
import { absensiApi, kelasApi, usersApi } from '../../lib/api';

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FormAbsensi({ onClose, onSuccess }) {
  const [tanggal, setTanggal]   = useState('');
  const [matkulId, setMatkulId] = useState('');
  const [step, setStep]         = useState(1); // 1: buat sesi, 2: input kehadiran
  const [sesiId, setSesiId]     = useState(null);
  const [entries, setEntries]   = useState({});

  const { data: matkulList } = useApi(() => kelasApi.matkul(), []);
  const { data: userList }   = useApi(() => usersApi.list(), []);
  const mahasiswa = (userList ?? []).filter(u => u.role === 'mahasiswa');

  const { mutate: buatSesi, loading: loadingSesi, error: errorSesi } = useMutation(
    (data) => absensiApi.create(data)
  );

  // BUG FIX: inputDetail dipanggil dengan (id, ent) tapi useMutation hanya wrap 1 fungsi.
  // Perbaiki agar argument diteruskan dengan benar via closure saat mutate dipanggil.
  const { mutate: inputDetail, loading: loadingDetail } = useMutation(
    ({ id, ent }) => absensiApi.inputDetail(id, ent)
  );

  async function handleBuatSesi() {
    if (!tanggal || !matkulId) return;
    const { ok, data } = await buatSesi({ tanggal, matkulId });
    if (ok) {
      setSesiId(data.id);
      const init = {};
      mahasiswa.forEach(u => { init[u.id] = 'hadir'; });
      setEntries(init);
      setStep(2);
    }
  }

  async function handleSimpan() {
    const entriArr = Object.entries(entries).map(([userId, status]) => ({ userId, status }));
    // BUG FIX: Panggil dengan satu objek agar args tidak ter-lost
    const { ok } = await inputDetail({ id: sesiId, ent: entriArr });
    if (ok) { onSuccess(); onClose(); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
        {step === 1 ? (
          <>
            <div className="modal__title">buat sesi absensi</div>
            <select className="modal__input" value={matkulId} onChange={e => setMatkulId(e.target.value)}>
              <option value="">— pilih mata kuliah —</option>
              {(matkulList ?? []).map(m => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
            <input className="modal__input" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            {errorSesi && <div className="modal__error">{errorSesi}</div>}
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
              <button className="modal__btn modal__btn--submit" onClick={handleBuatSesi} disabled={loadingSesi}>
                {loadingSesi ? 'membuat...' : 'lanjut →'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal__title">input kehadiran</div>
            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mahasiswa.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>
                    {u.nama}
                  </span>
                  <select
                    className="modal__input"
                    style={{ width: 120 }}
                    value={entries[u.id] ?? 'hadir'}
                    onChange={e => setEntries(prev => ({ ...prev, [u.id]: e.target.value }))}
                  >
                    <option value="hadir">hadir</option>
                    <option value="izin">izin</option>
                    <option value="alpha">alpha</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
              <button className="modal__btn modal__btn--submit" onClick={handleSimpan} disabled={loadingDetail}>
                {loadingDetail ? 'menyimpan...' : 'simpan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SectionAbsensi() {
  const { role } = useApp();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const { data, loading, error, refetch } = useApi(() => absensiApi.list(), []);

  const action = isAdmin
    ? { label: '+ input', onClick: () => setShowForm(true) }
    : null;

  // Hitung total kehadiran keseluruhan untuk summary
  const totalHadir = (data ?? []).reduce((s, a) => s + a.hadir, 0);
  const totalSesi  = (data ?? []).reduce((s, a) => s + a.total, 0);

  return (
    <div className="section-content">
      {showForm && (
        <FormAbsensi
          onClose={() => setShowForm(false)}
          onSuccess={refetch}
        />
      )}
      <ObsCard title="rekap-absensi" action={action}>
        {loading && <div className="mono-dim">memuat...</div>}
        {error   && <div className="mono-dim">gagal memuat: {error}</div>}
        {!loading && !error && (
          <>
            <table className="obs-table">
              <thead>
                <tr>
                  <th>tanggal</th>
                  <th>matkul</th>
                  <th>hadir</th>
                  <th>izin</th>
                  <th>alpha</th>
                  <th>persentase</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>
                      Belum ada data absensi.
                    </td>
                  </tr>
                )}
                {(data ?? []).map((a) => (
                  <tr key={a.id}>
                    <td><span className="mono-dim">{formatTanggal(a.tanggal)}</span></td>
                    <td><span className="mono-tag">{a.matkul?.kode}</span></td>
                    <td>{a.hadir}</td>
                    <td>{a.izin}</td>
                    <td>{a.alpha}</td>
                    <td style={{ minWidth: 140 }}>
                      <ProgressBar value={a.hadir} max={a.total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalSesi > 0 && (
              <div className="obs-table__footer">
                rata-rata kehadiran keseluruhan: {Math.round((totalHadir / totalSesi) * 100)}%
              </div>
            )}
          </>
        )}
      </ObsCard>
    </div>
  );
}
