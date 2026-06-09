import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import ConfirmModal from '../ui/ConfirmModal';
import { useApi, useMutation } from '../../hooks/useApi';
import { pengumumanApi } from '../../lib/api';

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FormPengumuman({ onClose, onSuccess, initial = null }) {
  const isEdit = !!initial;
  const [judul, setJudul] = useState(initial?.judul ?? '');
  const [isi, setIsi]     = useState(initial?.isi   ?? '');
  const [label, setLabel] = useState(initial?.label ?? 'info');
  const [validErr, setValidErr] = useState('');
  const { mutate, loading, error } = useMutation((data) =>
    isEdit ? pengumumanApi.update(initial.id, data) : pengumumanApi.create(data)
  );

  async function handleSubmit() {
    // BUG FIX: validasi sebelumnya diam-diam return jika !judul||!isi
    // tanpa pesan error ke user. Sekarang tampilkan pesan.
    if (!judul.trim()) { setValidErr('Judul tidak boleh kosong.'); return; }
    if (!isi.trim())   { setValidErr('Isi pengumuman tidak boleh kosong.'); return; }
    setValidErr('');
    const { ok } = await mutate({ judul: judul.trim(), isi: isi.trim(), label });
    if (ok) { onSuccess(); onClose(); }
  }

  const displayError = validErr || error;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">{isEdit ? 'edit pengumuman' : 'tulis pengumuman'}</div>
        <input
          className="modal__input"
          placeholder="judul"
          value={judul}
          onChange={e => { setJudul(e.target.value); setValidErr(''); }}
        />
        <textarea
          className="modal__input modal__textarea"
          placeholder="isi pengumuman..."
          value={isi}
          onChange={e => { setIsi(e.target.value); setValidErr(''); }}
        />
        <select className="modal__input" value={label} onChange={e => setLabel(e.target.value)}>
          <option value="info">info</option>
          <option value="penting">penting</option>
          <option value="jadwal">jadwal</option>
        </select>
        {displayError && <div className="modal__error">{displayError}</div>}
        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
          <button className="modal__btn modal__btn--submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'menyimpan...' : isEdit ? 'simpan' : 'kirim'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SectionPengumuman() {
  const { role } = useApp();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { data, loading, error, refetch } = useApi(() => pengumumanApi.list(), []);
  const { mutate: hapus, loading: loadingHapus } = useMutation((id) => pengumumanApi.remove(id));

  async function handleHapus() {
    const { ok } = await hapus(confirmId);
    if (ok) { refetch(); setConfirmId(null); }
  }

  const action = isAdmin ? { label: '+ tulis', onClick: () => setShowForm(true) } : null;

  return (
    <div className="section-content">
      {showForm && <FormPengumuman onClose={() => setShowForm(false)} onSuccess={refetch} />}
      {editItem  && <FormPengumuman onClose={() => setEditItem(null)} onSuccess={refetch} initial={editItem} />}
      {confirmId && (
        <ConfirmModal
          pesan="Yakin hapus pengumuman ini?"
          onConfirm={handleHapus}
          onCancel={() => setConfirmId(null)}
          loading={loadingHapus}
        />
      )}
      <ObsCard title="pengumuman" action={action}>
        {loading && <div className="mono-dim">memuat...</div>}
        {error   && <div className="mono-dim">gagal memuat: {error}</div>}
        {!loading && !error && (data ?? []).length === 0 && (
          <div className="mono-dim">belum ada pengumuman</div>
        )}
        {(data ?? []).map(p => (
          <div key={p.id} className="ann-row ann-row--full">
            <Avatar inisial={p.author.inisial} color={p.author.color} size={32} />
            <div style={{ flex: 1 }}>
              <div className="ann-row__title">
                {p.judul} <Badge label={p.label} />
              </div>
              <div className="ann-row__body">{p.isi}</div>
              <div className="ann-row__meta">{formatTanggal(p.createdAt)} &bull; {p.author.nama}</div>
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button className="del-btn" style={{ color: 'var(--text3)' }} onClick={() => setEditItem(p)}>✎</button>
                <button className="del-btn" onClick={() => setConfirmId(p.id)}>✕</button>
              </div>
            )}
          </div>
        ))}
      </ObsCard>
    </div>
  );
}
