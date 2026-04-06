import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import { useApi } from '../../hooks/useApi';
import { useMutation } from '../../hooks/useMutation';
import { matkulApi } from '../../lib/api';

const EMPTY = { kode: '', nama: '', dosen: '', sks: '3' };

export default function SectionMatkul() {
  const { role } = useApp();
  const isAdmin = role === 'admin';

  const { data: matkul, refetch } = useApi(() => matkulApi.list(), []);

  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { id, kode, nama, dosen, sks }
  const [form, setForm]           = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errMsg, setErrMsg]       = useState('');

  const { mutate: createMatkul, loading: creating } = useMutation(matkulApi.create);
  const { mutate: updateMatkul, loading: updating } = useMutation((data) => matkulApi.update(editTarget?.id, data));
  const { mutate: deleteMatkul, loading: deleting } = useMutation((id) => matkulApi.remove(id));

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY);
    setErrMsg('');
    setShowForm(true);
  }

  function openEdit(mk) {
    setEditTarget(mk);
    setForm({ kode: mk.kode, nama: mk.nama, dosen: mk.dosen, sks: String(mk.sks ?? 3) });
    setErrMsg('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY);
    setErrMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg('');
    if (!form.kode.trim() || !form.nama.trim() || !form.dosen.trim()) {
      setErrMsg('Kode, nama, dan dosen wajib diisi.');
      return;
    }
    const payload = { ...form, sks: parseInt(form.sks) || 3 };
    const result = editTarget
      ? await updateMatkul(payload)
      : await createMatkul(payload);
    if (!result.ok) {
      setErrMsg(result.error ?? 'Gagal menyimpan.');
      return;
    }
    closeForm();
    refetch();
  }

  async function handleDelete() {
    const result = await deleteMatkul(deleteTarget?.id);
    if (!result.ok) {
      setDeleteTarget(null);
      alert(result.error ?? 'Gagal menghapus.');
      return;
    }
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="section-content">
      <ObsCard title="mata-kuliah">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {matkul?.length ?? 0} matkul terdaftar
          </span>
          {isAdmin && (
            <button className="btn-primary" onClick={openCreate} style={{ fontSize: 11, padding: '4px 12px' }}>
              + tambah matkul
            </button>
          )}
        </div>

        {/* Tabel matkul */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(!matkul || matkul.length === 0) && (
            <div className="mono-dim">belum ada mata kuliah</div>
          )}
          {(matkul ?? []).map(mk => (
            <div
              key={mk.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                background: 'var(--bg3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border1)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>
                {mk.kode}
              </span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 600 }}>{mk.nama}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{mk.dosen}</div>
              </div>
              <div>
                <Badge label={`${mk.sks ?? 3} SKS`} />
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEdit(mk)}
                    style={btnStyle('var(--accent)')}
                  >
                    edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(mk)}
                    style={btnStyle('var(--red)')}
                  >
                    hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ObsCard>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal__title">
              {editTarget ? `edit matkul — ${editTarget.kode}` : 'tambah mata kuliah'}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="form-label">
                kode matkul
                <input
                  className="form-input"
                  placeholder="IF301"
                  value={form.kode}
                  onChange={e => setForm(f => ({ ...f, kode: e.target.value.toUpperCase() }))}
                  disabled={!!editTarget} // kode tidak bisa diubah saat edit
                />
              </label>
              <label className="form-label">
                nama matkul
                <input
                  className="form-input"
                  placeholder="Pemrograman Web"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                />
              </label>
              <label className="form-label">
                dosen pengampu
                <input
                  className="form-input"
                  placeholder="Dr. Budi Santoso"
                  value={form.dosen}
                  onChange={e => setForm(f => ({ ...f, dosen: e.target.value }))}
                />
              </label>
              <label className="form-label">
                jumlah SKS
                <select
                  className="form-input"
                  value={form.sks}
                  onChange={e => setForm(f => ({ ...f, sks: e.target.value }))}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} SKS</option>
                  ))}
                </select>
              </label>

              {errMsg && (
                <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                  ✗ {errMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={closeForm}>batal</button>
                <button type="submit" className="btn-primary" disabled={creating || updating}>
                  {creating || updating ? 'menyimpan…' : editTarget ? 'simpan perubahan' : 'tambah matkul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm hapus */}
      {deleteTarget && (
        <ConfirmModal
          pesan={`Yakin hapus ${deleteTarget?.nama}? Matkul yang masih punya tugas/materi/jadwal tidak bisa dihapus.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

function btnStyle(color) {
  return {
    padding: '3px 9px',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    color,
    border: `1px solid ${color}`,
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  };
}