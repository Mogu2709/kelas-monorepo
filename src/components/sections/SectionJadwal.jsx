import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import { useApi, useMutation } from '../../hooks/useApi';
import { jadwalApi, kelasApi } from '../../lib/api';
import ConfirmModal from '../ui/ConfirmModal';

const HARI_ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
const COLORS = ['#7c5cbf', '#4ecdc4', '#5865f2', '#faa61a', '#43b581', '#f04747'];

function FormJadwal({ onClose, onSuccess }) {
  const [hari, setHari]           = useState('senin');
  const [jamMulai, setJamMulai]   = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [ruang, setRuang]         = useState('');
  const [matkulId, setMatkulId]   = useState('');
  const [validErr, setValidErr]   = useState('');
  const { data: matkulList }      = useApi(() => kelasApi.matkul(), []);
  const { mutate, loading, error } = useMutation((data) => jadwalApi.create(data));

  async function handleSubmit() {
    if (!matkulId)    { setValidErr('Pilih mata kuliah.'); return; }
    if (!jamMulai || !jamSelesai) { setValidErr('Jam mulai dan selesai wajib diisi.'); return; }
    if (!ruang.trim()) { setValidErr('Ruangan wajib diisi.'); return; }
    setValidErr('');
    const { ok } = await mutate({ hari, jamMulai, jamSelesai, ruang: ruang.trim(), matkulId });
    if (ok) { onSuccess(); onClose(); }
  }

  const displayError = validErr || error;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">tambah jadwal</div>
        <select className="modal__input" value={hari} onChange={e => setHari(e.target.value)}>
          {HARI_ORDER.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select className="modal__input" value={matkulId} onChange={e => { setMatkulId(e.target.value); setValidErr(''); }}>
          <option value="">— pilih mata kuliah —</option>
          {(matkulList ?? []).map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="modal__label">Jam Mulai</div>
            <input className="modal__input" type="time" value={jamMulai} onChange={e => { setJamMulai(e.target.value); setValidErr(''); }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="modal__label">Jam Selesai</div>
            <input className="modal__input" type="time" value={jamSelesai} onChange={e => { setJamSelesai(e.target.value); setValidErr(''); }} />
          </div>
        </div>
        <input className="modal__input" placeholder="ruangan (misal: C-301)" value={ruang} onChange={e => { setRuang(e.target.value); setValidErr(''); }} />
        {displayError && <div className="modal__error">{displayError}</div>}
        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
          <button className="modal__btn modal__btn--submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'menyimpan...' : 'simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SectionJadwal() {
  const { role } = useApp();
  const isAdmin = role === 'admin';
  // BUG FIX: tombol edit jadwal sebelumnya memanggil alert('coming soon') — tidak berguna.
  // Sekarang tampilkan FormJadwal yang fungsional + hapus jadwal.
  const [showForm, setShowForm]   = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const { data, loading, error, refetch } = useApi(() => jadwalApi.list(), []);
  const { mutate: hapus } = useMutation((id) => jadwalApi.remove(id));

  async function handleHapus() {
    const { ok } = await hapus(confirmId);
    if (ok) { refetch(); setConfirmId(null); }
  }

  const action = isAdmin
    ? { label: '+ jadwal', onClick: () => setShowForm(true) }
    : null;

  const grouped = (data ?? []).reduce((acc, j) => {
    const hari = j.hari.toLowerCase();
    if (!acc[hari]) acc[hari] = [];
    acc[hari].push(j);
    return acc;
  }, {});

  const matkulKeys = [...new Set((data ?? []).map(j => j.matkulId))];
  const colorMap = Object.fromEntries(matkulKeys.map((k, i) => [k, COLORS[i % COLORS.length]]));

  const hariAda = HARI_ORDER.filter(h => grouped[h]);

  return (
    <div className="section-content">
      {showForm && <FormJadwal onClose={() => setShowForm(false)} onSuccess={refetch} />}
      {confirmId && (
        <ConfirmModal
          pesan="Yakin hapus jadwal ini?"
          onConfirm={handleHapus}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <ObsCard title="jadwal-minggu" action={action}>
        {loading && <div className="mono-dim">memuat...</div>}
        {error   && <div className="mono-dim">gagal memuat: {error}</div>}
        {!loading && !error && hariAda.length === 0 && (
          <div className="mono-dim">belum ada jadwal</div>
        )}
        {!loading && !error && (
          <div className="two-col">
            {hariAda.map(hari => (
              <div key={hari}>
                <div className="hari-label">{hari}</div>
                {grouped[hari].map((j) => (
                  <div key={j.id} className="sched-row" style={{ position: 'relative' }}>
                    <div className="sched-row__time" style={{ color: colorMap[j.matkulId] }}>
                      {j.jamMulai}–{j.jamSelesai}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="sched-row__name">{j.matkul?.nama}</div>
                      <div className="sched-row__meta">{j.ruang} &bull; {j.matkul?.dosen}</div>
                    </div>
                    {isAdmin && (
                      <button
                        className="del-btn"
                        onClick={() => setConfirmId(j.id)}
                        title="Hapus jadwal"
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </ObsCard>
    </div>
  );
}
