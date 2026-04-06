import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import ProgressBar from '../ui/ProgressBar';
import { useApi, useMutation } from '../../hooks/useApi';
import { absensiApi, kelasApi, usersApi } from '../../lib/api';
import ConfirmModal from '../ui/ConfirmModal';
import {
  exportExcelPerSesi,
  exportExcelPerMahasiswa,
  exportPDFPerSesi,
  exportPDFPerMahasiswa,
} from '../../lib/exportAbsensi';

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Form buat sesi absensi ────────────────────────────────────────────────────
function FormAbsensi({ onClose, onSuccess }) {
  const [tanggal, setTanggal]   = useState('');
  const [matkulId, setMatkulId] = useState('');
  const [step, setStep]         = useState(1);
  const [sesiId, setSesiId]     = useState(null);
  const [entries, setEntries]   = useState({});

  const { data: matkulList } = useApi(() => kelasApi.matkul(), []);
  const { data: userList }   = useApi(() => usersApi.list(), []);
  const mahasiswa = (userList ?? []).filter(u => u.role === 'mahasiswa');

  const { mutate: buatSesi,    loading: loadingSesi,   error: errorSesi   } = useMutation((data) => absensiApi.create(data));
  const { mutate: inputDetail, loading: loadingDetail                      } = useMutation(({ id, ent }) => absensiApi.inputDetail(id, ent));

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
                    style={{ width: 120, marginBottom: 0 }}
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

// ── Dropdown export ───────────────────────────────────────────────────────────
function ExportMenu({ data, kelasNama }) {
  const [open, setOpen]       = useState(false);
  const [status, setStatus]   = useState(''); // 'loading' | 'done' | 'error'
  const [msg, setMsg]         = useState('');
  const ref = useRef(null);

  async function run(fn, label) {
    setOpen(false);
    setStatus('loading');
    setMsg(`Menyiapkan ${label}...`);
    try {
      await fn(data, kelasNama);
      setStatus('done');
      setMsg(`${label} berhasil diunduh!`);
    } catch (e) {
      setStatus('error');
      setMsg(`Gagal: ${e.message}`);
    } finally {
      setTimeout(() => { setStatus(''); setMsg(''); }, 3000);
    }
  }

  const items = [
    { label: '📊 Excel — per sesi',        fn: exportExcelPerSesi        },
    { label: '📊 Excel — per mahasiswa',    fn: exportExcelPerMahasiswa   },
    { label: '📄 PDF — per sesi',           fn: exportPDFPerSesi          },
    { label: '📄 PDF — per mahasiswa',      fn: exportPDFPerMahasiswa     },
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <button
        className="modal__btn modal__btn--cancel"
        style={{ fontSize: 11, padding: '4px 10px' }}
        onClick={() => setOpen(o => !o)}
        disabled={status === 'loading' || !data?.length}
        title={!data?.length ? 'Belum ada data absensi' : ''}
      >
        {status === 'loading' ? '⏳ mengekspor...' : '↓ export'}
      </button>

      {open && (
        <div className="export-menu">
          {items.map(item => (
            <button
              key={item.label}
              className="export-menu__item"
              onClick={() => run(item.fn, item.label)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {msg && (
        <div className={`export-toast ${status === 'error' ? 'export-toast--error' : status === 'done' ? 'export-toast--done' : ''}`}>
          {msg}
        </div>
      )}
    </div>
  );
}

// ── Section utama ─────────────────────────────────────────────────────────────
export default function SectionAbsensi() {
  const { role, kelas } = useApp();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const { data, loading, error, refetch } = useApi(() => absensiApi.list(), []);
  const { mutate: hapus } = useMutation((id) => absensiApi.remove(id));

  async function handleHapus() {
    const { ok } = await hapus(confirmId);
    if (ok) { refetch(); setConfirmId(null); }
  }

  const action = isAdmin
    ? { label: '+ input', onClick: () => setShowForm(true) }
    : null;

  const totalHadir = (data ?? []).reduce((s, a) => s + a.hadir, 0);
  const totalSesi  = (data ?? []).reduce((s, a) => s + a.total, 0);
  const kelasNama  = kelas?.nama ?? 'Kelas';

  return (
    <div className="section-content">
      {showForm && (
        <FormAbsensi onClose={() => setShowForm(false)} onSuccess={refetch} />
      )}
      {confirmId && (
        <ConfirmModal
          pesan="Yakin hapus sesi absensi ini? Data kehadiran dalam sesi ini juga akan dihapus."
          onConfirm={handleHapus}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <ObsCard title="rekap-absensi" action={action}>
        {/* Tombol export — tampil untuk semua role kalau ada data */}
        {!loading && !error && (data ?? []).length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <ExportMenu data={data} kelasNama={kelasNama} />
          </div>
        )}

        {loading && <div className="mono-dim">memuat...</div>}
        {error   && <div className="mono-dim">gagal memuat: {error}</div>}
        {!loading && !error && (
          <>
            <div className="obs-table-wrap">
            <table className="obs-table">
              <thead>
                <tr>
                  <th>tanggal</th>
                  <th>matkul</th>
                  <th>hadir</th>
                  <th>izin</th>
                  <th>alpha</th>
                  <th>persentase</th>
                  {isAdmin && <th></th>}
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
                {(data ?? []).map(a => (
                  <tr key={a.id}>
                    <td><span className="mono-dim">{formatTanggal(a.tanggal)}</span></td>
                    <td><span className="mono-tag">{a.matkul?.kode}</span></td>
                    <td>{a.hadir}</td>
                    <td>{a.izin}</td>
                    <td style={{ color: a.alpha > 0 ? 'var(--red)' : 'inherit' }}>{a.alpha}</td>
                    <td style={{ minWidth: 140 }}>
                      <ProgressBar value={a.hadir} max={a.total} />
                    </td>
                    {isAdmin && (
                      <td>
                        <button className="del-btn" onClick={() => setConfirmId(a.id)} title="Hapus sesi">✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {totalSesi > 0 && (
              <div className="obs-table__footer">
                rata-rata kehadiran keseluruhan: {Math.round((totalHadir / totalSesi) * 100)}%
                &nbsp;&bull;&nbsp;{(data ?? []).length} sesi tercatat
              </div>
            )}
          </>
        )}
      </ObsCard>
    </div>
  );
}