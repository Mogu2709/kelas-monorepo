import { useState } from 'react';
import ObsCard from '../ui/ObsCard';
import Avatar from '../ui/Avatar';
import ConfirmModal from '../ui/ConfirmModal';
import { usersApi } from '../../lib/api';
import { useApi, useMutation } from '../../hooks/useApi';

function ModalTambahUser({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nama: '', username: '', nim: '', password: '', role: 'mahasiswa' });
  const [error, setError] = useState('');
  const { mutate, loading } = useMutation((data) => usersApi.create(data));

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  }

  async function handleSubmit() {
    if (!form.nama.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Nama, username, dan password wajib diisi.'); return;
    }
    if (form.role === 'mahasiswa' && !form.nim.trim()) {
      setError('NIM wajib diisi untuk mahasiswa.'); return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.'); return;
    }
    const result = await mutate({
      nama: form.nama.trim(),
      username: form.username.trim().toLowerCase(),
      password: form.password,
      nim: form.nim.trim() || null,
      role: form.role,
    });
    if (!result.ok) { setError(result.error); return; }
    onSuccess(result.data);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">buat akun baru</div>

        <div style={{ marginBottom: 10 }}>
          <div className="modal__label">Role</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['mahasiswa', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => set('role', r)}
                className={`modal__role-btn ${form.role === r ? 'modal__role-btn--active' : ''}`}
              >{r}</button>
            ))}
          </div>
        </div>

        <div className="modal__label">Nama lengkap</div>
        <input className="modal__input" placeholder="Rizka Hana" value={form.nama} onChange={e => set('nama', e.target.value)} />

        <div className="modal__label">Username</div>
        <input className="modal__input" placeholder="rizka" value={form.username} onChange={e => set('username', e.target.value)} />

        {form.role === 'mahasiswa' && (
          <>
            <div className="modal__label">NIM</div>
            <input className="modal__input" placeholder="2024001" value={form.nim} onChange={e => set('nim', e.target.value)} />
          </>
        )}

        <div className="modal__label">Password</div>
        <input className="modal__input" type="password" placeholder="min. 6 karakter" value={form.password} onChange={e => set('password', e.target.value)} />

        {error && <div className="modal__error">{error}</div>}

        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
          <button className="modal__btn modal__btn--submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'membuat...' : 'buat akun'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SectionMahasiswa() {
  const { data: users, loading, error, refetch } = useApi(() => usersApi.list(), []);
  const { mutate: doDelete } = useMutation((id) => usersApi.remove(id));
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmNama, setConfirmNama] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function triggerDelete(id, nama) {
    setConfirmId(id);
    setConfirmNama(nama);
  }

  async function handleDelete() {
    const result = await doDelete(confirmId);
    setConfirmId(null);
    if (!result.ok) { showToast(`Gagal: ${result.error}`); return; }
    refetch();
    showToast('Akun berhasil dihapus.');
  }

  function handleSuccess() {
    setShowModal(false);
    refetch();
    showToast('Akun berhasil dibuat.');
  }

  const mahasiswaUsers = (users ?? []).filter(u => u.role === 'mahasiswa');
  const adminUsers     = (users ?? []).filter(u => u.role === 'admin');

  if (loading) return <div className="mono-dim" style={{ padding: 20 }}>memuat data...</div>;
  if (error)   return <div style={{ color: 'var(--red)', fontSize: 12, padding: 20 }}>Error: {error}</div>;

  return (
    <div className="section-content">
      {toast && (
        <div className="toast toast--success">{toast}</div>
      )}

      {showModal && <ModalTambahUser onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}

      {confirmId && (
        <ConfirmModal
          pesan={`Hapus akun ${confirmNama}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <ObsCard
        title={`daftar-mahasiswa (${mahasiswaUsers.length})`}
        action={{ label: '+ buat akun', onClick: () => setShowModal(true) }}
      >
        <table className="obs-table">
          <thead>
            <tr>
              <th>nama</th>
              <th>username</th>
              <th>nim</th>
              <th>dibuat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mahasiswaUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar inisial={u.inisial} color={u.color} size={24} />
                    {u.nama}
                  </div>
                </td>
                <td><span className="mono-dim">@{u.username}</span></td>
                <td><span className="mono-dim">{u.nim ?? '—'}</span></td>
                <td><span className="mono-dim">{u.createdAt?.slice(0, 10)}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="del-btn" onClick={() => triggerDelete(u.id, u.nama)}>hapus</button>
                </td>
              </tr>
            ))}
            {mahasiswaUsers.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 16 }}>Belum ada mahasiswa terdaftar.</td></tr>
            )}
          </tbody>
        </table>
        <div className="obs-table__footer">total {mahasiswaUsers.length} akun mahasiswa</div>
      </ObsCard>

      <ObsCard title={`pengelola-kelas (${adminUsers.length})`}>
        <table className="obs-table">
          <thead>
            <tr><th>nama</th><th>username</th><th>dibuat</th><th></th></tr>
          </thead>
          <tbody>
            {adminUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar inisial={u.inisial} color={u.color} size={24} />
                    {u.nama}
                  </div>
                </td>
                <td><span className="mono-dim">@{u.username}</span></td>
                <td><span className="mono-dim">{u.createdAt?.slice(0, 10)}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {adminUsers.length > 1
                    ? <button className="del-btn" onClick={() => triggerDelete(u.id, u.nama)}>hapus</button>
                    : <span className="mono-dim">protected</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ObsCard>
    </div>
  );
}
