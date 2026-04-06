import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import { useApi, useMutation } from '../../hooks/useApi';
import { tugasApi, kelasApi } from '../../lib/api';

function formatDeadline(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(isoDeadline, status) {
  if (status === 'selesai') return false;
  return new Date(isoDeadline) < new Date();
}

// ── Form buat tugas baru ──────────────────────────────────────────────────────
function FormTugas({ onClose, onSuccess }) {
  const [judul, setJudul]         = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline]   = useState('');
  const [matkulId, setMatkulId]   = useState('');
  const [total, setTotal]         = useState(32);
  const [validErr, setValidErr]   = useState('');
  const { data: matkulList }      = useApi(() => kelasApi.matkul(), []);
  const { mutate, loading, error } = useMutation((data) => tugasApi.create(data));

  async function handleSubmit() {
    if (!judul.trim())  { setValidErr('Judul tugas tidak boleh kosong.'); return; }
    if (!matkulId)      { setValidErr('Pilih mata kuliah terlebih dahulu.'); return; }
    if (!deadline)      { setValidErr('Deadline wajib diisi.'); return; }
    setValidErr('');
    const { ok } = await mutate({ judul: judul.trim(), deskripsi, deadline, matkulId, total: Number(total) });
    if (ok) { onSuccess(); onClose(); }
  }

  const displayError = validErr || error;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">buat tugas</div>
        <input
          className="modal__input"
          placeholder="judul tugas"
          value={judul}
          onChange={e => { setJudul(e.target.value); setValidErr(''); }}
        />
        <textarea
          className="modal__input modal__textarea"
          placeholder="deskripsi (opsional)"
          value={deskripsi}
          onChange={e => setDeskripsi(e.target.value)}
        />
        <select className="modal__input" value={matkulId} onChange={e => { setMatkulId(e.target.value); setValidErr(''); }}>
          <option value="">— pilih mata kuliah —</option>
          {(matkulList ?? []).map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </select>
        <input className="modal__input" type="date" value={deadline}
          onChange={e => { setDeadline(e.target.value); setValidErr(''); }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            total mahasiswa:
          </label>
          <input
            className="modal__input"
            type="number"
            min={1} max={200}
            style={{ flex: 1, marginBottom: 0 }}
            value={total}
            onChange={e => setTotal(e.target.value)}
          />
        </div>
        {displayError && <div className="modal__error">{displayError}</div>}
        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
          <button className="modal__btn modal__btn--submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'menyimpan...' : 'buat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal edit terkumpul & status (admin) ─────────────────────────────────────
function ModalEditTugas({ tugas, onClose, onSuccess }) {
  const [terkumpul, setTerkumpul] = useState(tugas.terkumpul);
  const [status, setStatus]       = useState(tugas.status);
  const [deadline, setDeadline]   = useState(tugas.deadline?.slice(0, 10) ?? '');
  const statusList = ['baru', 'aktif', 'urgent', 'selesai'];
  const { mutate, loading, error } = useMutation((data) => tugasApi.update(tugas.id, data));

  async function handleSubmit() {
    const { ok } = await mutate({
      terkumpul: Number(terkumpul),
      status,
      deadline: deadline || undefined,
    });
    if (ok) { onSuccess(); onClose(); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">update tugas</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, fontWeight: 600 }}>{tugas.judul}</div>

        <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          terkumpul ({terkumpul}/{tugas.total})
        </label>
        <input
          className="modal__input"
          type="range"
          min={0} max={tugas.total}
          value={terkumpul}
          onChange={e => setTerkumpul(e.target.value)}
          style={{ marginBottom: 4, padding: 0, background: 'none', border: 'none' }}
        />
        {/* Progress bar visual */}
        <div style={{
          height: 6, borderRadius: 3, background: 'var(--bg3)',
          marginBottom: 12, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(terkumpul / tugas.total) * 100}%`,
            background: 'var(--purple)',
            borderRadius: 3,
            transition: 'width 0.2s',
          }} />
        </div>

        <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>status</label>
        <select className="modal__input" value={status} onChange={e => setStatus(e.target.value)}>
          {statusList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>deadline</label>
        <input className="modal__input" type="date" value={deadline}
          onChange={e => setDeadline(e.target.value)} />

        {error && <div className="modal__error">{error}</div>}
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

// ── Tabel tugas ───────────────────────────────────────────────────────────────
function TugasTable({ rows, isAdmin, onHapus, onEdit }) {
  if (rows.length === 0) {
    return <div className="mono-dim" style={{ padding: '8px 0' }}>tidak ada tugas</div>;
  }
  return (
    <table className="obs-table">
      <thead>
        <tr>
          <th>judul</th>
          <th>matkul</th>
          <th>deadline</th>
          <th>terkumpul</th>
          <th>status</th>
          {isAdmin && <th></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(t => {
          const pct     = Math.round((t.terkumpul / (t.total || 1)) * 100);
          const overdue = isOverdue(t.deadline, t.status);
          return (
            <tr key={t.id}>
              <td>
                {t.judul}
                {overdue && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                    overdue
                  </span>
                )}
                {t.deskripsi && (
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{t.deskripsi}</div>
                )}
              </td>
              <td><span className="mono-tag">{t.matkul?.kode}</span></td>
              <td>
                <span className={overdue ? '' : ''} style={{ color: overdue ? 'var(--red)' : 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {formatDeadline(t.deadline)}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 80 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {t.terkumpul}/{t.total}
                    <span style={{ color: 'var(--text3)', marginLeft: 4 }}>({pct}%)</span>
                  </span>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--purple)' : 'var(--yellow)',
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              </td>
              <td><Badge label={t.status} /></td>
              {isAdmin && (
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="del-btn"
                      style={{ color: 'var(--text3)', fontSize: 12 }}
                      onClick={() => onEdit(t)}
                      title="Update terkumpul & status"
                    >✎</button>
                    <button className="del-btn" onClick={() => onHapus(t.id)} title="Hapus tugas">✕</button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Section utama ─────────────────────────────────────────────────────────────
export default function SectionTugas() {
  const { role } = useApp();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm]   = useState(false);
  const [editTugas, setEditTugas] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { data: semua, loading, error, refetch } = useApi(() => tugasApi.list(), []);
  const { mutate: hapus } = useMutation((id) => tugasApi.remove(id));

  async function handleHapus() {
    const { ok } = await hapus(confirmId);
    if (ok) { refetch(); setConfirmId(null); }
  }

  const aktif   = semua?.filter(t => t.status !== 'selesai') ?? [];
  const selesai = semua?.filter(t => t.status === 'selesai') ?? [];

  const action = isAdmin
    ? { label: '+ buat', onClick: () => setShowForm(true) }
    : null;

  return (
    <div className="section-content">
      {showForm && <FormTugas onClose={() => setShowForm(false)} onSuccess={refetch} />}
      {editTugas && (
        <ModalEditTugas
          tugas={editTugas}
          onClose={() => setEditTugas(null)}
          onSuccess={refetch}
        />
      )}
      {confirmId && (
        <ConfirmModal
          pesan="Yakin hapus tugas ini?"
          onConfirm={handleHapus}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <ObsCard title={`tugas aktif (${aktif.length})`} action={action}>
        {loading && <div className="mono-dim">memuat...</div>}
        {error   && <div className="mono-dim">gagal memuat: {error}</div>}
        {!loading && !error && (
          <TugasTable rows={aktif} isAdmin={isAdmin} onHapus={setConfirmId} onEdit={setEditTugas} />
        )}
      </ObsCard>
      {!loading && !error && selesai.length > 0 && (
        <ObsCard title={`selesai (${selesai.length})`}>
          <TugasTable rows={selesai} isAdmin={isAdmin} onHapus={setConfirmId} onEdit={setEditTugas} />
        </ObsCard>
      )}
    </div>
  );
}