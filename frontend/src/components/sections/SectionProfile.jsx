import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import ObsCard from '../ui/ObsCard';
import Avatar from '../ui/Avatar';
import { profileApi } from '../../lib/api';
import { useMutation } from '../../hooks/useMutation';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

const COLOR_PRESETS = [
  '#7c5cbf', '#5b7dd8', '#3ba55d', '#ed4245',
  '#faa61a', '#00b0f4', '#f47fff', '#eb459e',
];

export default function SectionProfile() {
  const { currentUser, kelas, refreshUser } = useApp();
  const { logout } = useAuth();

  const [tab, setTab] = useState('profil'); // 'profil' | 'keamanan'
  const [form, setForm] = useState({
    nama:    currentUser?.nama    ?? '',
    inisial: currentUser?.inisial ?? '',
    tag:     currentUser?.tag     ?? '',
    nim:     currentUser?.nim     ?? '',
    color:   currentUser?.color   ?? '#7c5cbf',
  });
  const [pwForm, setPwForm] = useState({ lama: '', baru: '', konfirmasi: '' });
  const [msg, setMsg]       = useState(null); // { type: 'ok'|'err', text }
  const [pwMsg, setPwMsg]   = useState(null);
  const fileRef = useRef(null);

  const { mutate: updateProfile, loading: saving } = useMutation(
    (data) => profileApi.update(currentUser.id, data)
  );
  const { mutate: uploadAvatar, loading: uploading } = useMutation(
    (fd) => profileApi.uploadAvatar(currentUser.id, fd)
  );
  const { mutate: changePassword, loading: changingPw } = useMutation(
    (pw) => profileApi.changePassword(currentUser.id, pw)
  );

  // Avatar URL — bisa local atau cloud
  const avatarUrl = currentUser?.avatarUrl
    ? (currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `${BASE_URL}${currentUser.avatarUrl}`)
    : null;

  async function handleSaveProfile(e) {
    e.preventDefault();
    setMsg(null);
    const result = await updateProfile(form);
    if (!result.ok) { setMsg({ type: 'err', text: result.error ?? 'Gagal menyimpan.' }); return; }
    if (refreshUser) await refreshUser();
    setMsg({ type: 'ok', text: 'Profil berhasil disimpan.' });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'Ukuran foto maksimal 2MB.' });
      return;
    }
    const fd = new FormData();
    fd.append('avatar', file);
    const result = await uploadAvatar(fd);
    if (!result.ok) { setMsg({ type: 'err', text: result.error ?? 'Gagal upload.' }); return; }
    if (refreshUser) await refreshUser();
    setMsg({ type: 'ok', text: 'Foto profil diperbarui.' });
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (!pwForm.baru || pwForm.baru.length < 6) {
      setPwMsg({ type: 'err', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (pwForm.baru !== pwForm.konfirmasi) {
      setPwMsg({ type: 'err', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    const result = await changePassword(pwForm.baru);
    if (!result.ok) { setPwMsg({ type: 'err', text: result.error ?? 'Gagal ganti password.' }); return; }
    setPwForm({ lama: '', baru: '', konfirmasi: '' });
    setPwMsg({ type: 'ok', text: 'Password berhasil diubah.' });
  }

  return (
    <div className="section-content">
      {/* Header profil */}
      <ObsCard title="profil-saya">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0 12px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border2)' }}
              />
            ) : (
              <Avatar
                inisial={currentUser?.inisial ?? '?'}
                color={currentUser?.color ?? '#7c5cbf'}
                size={56}
                status="online"
              />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: -2,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--accent)', border: 'none',
                cursor: 'pointer', fontSize: 10, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Ganti foto"
            >
              {uploading ? '…' : '✎'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)' }}>
              {currentUser?.nama}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {currentUser?.tag} &bull; {currentUser?.role}
            </div>
            {currentUser?.nim && (
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>NIM: {currentUser.nim}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              {kelas?.nama}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border1)', marginBottom: 14 }}>
          {['profil', 'keamanan'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? 'var(--accent)' : 'var(--text3)',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: profil */}
        {tab === 'profil' && (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="form-label">
              nama lengkap
              <input
                className="form-input"
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label className="form-label">
                inisial (2-3 huruf)
                <input
                  className="form-input"
                  maxLength={3}
                  value={form.inisial}
                  onChange={e => setForm(f => ({ ...f, inisial: e.target.value.toUpperCase() }))}
                />
              </label>
              <label className="form-label">
                tag / username display
                <input
                  className="form-input"
                  placeholder="budi#1234"
                  value={form.tag}
                  onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                />
              </label>
            </div>

            {currentUser?.role === 'mahasiswa' && (
              <label className="form-label">
                NIM
                <input
                  className="form-input"
                  value={form.nim}
                  onChange={e => setForm(f => ({ ...f, nim: e.target.value }))}
                />
              </label>
            )}

            {/* Warna avatar */}
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>warna avatar</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: c, border: 'none', cursor: 'pointer',
                      outline: form.color === c ? `2px solid var(--text1)` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
                {/* Custom color picker */}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
                  title="Pilih warna custom"
                />
                <Avatar inisial={form.inisial || currentUser?.inisial || '?'} color={form.color} size={28} />
              </div>
            </div>

            {msg && (
              <div style={{ fontSize: 12, color: msg.type === 'ok' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {msg.type === 'ok' ? '✓' : '✗'} {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'menyimpan…' : 'simpan profil'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: keamanan */}
        {tab === 'keamanan' && (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="form-label">
              password baru
              <input
                type="password"
                className="form-input"
                placeholder="minimal 6 karakter"
                value={pwForm.baru}
                onChange={e => setPwForm(f => ({ ...f, baru: e.target.value }))}
                autoComplete="new-password"
              />
            </label>
            <label className="form-label">
              konfirmasi password baru
              <input
                type="password"
                className="form-input"
                placeholder="ulangi password baru"
                value={pwForm.konfirmasi}
                onChange={e => setPwForm(f => ({ ...f, konfirmasi: e.target.value }))}
                autoComplete="new-password"
              />
            </label>

            {pwMsg && (
              <div style={{ fontSize: 12, color: pwMsg.type === 'ok' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {pwMsg.type === 'ok' ? '✓' : '✗'} {pwMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="submit" className="btn-primary" disabled={changingPw}>
                {changingPw ? 'menyimpan…' : 'ganti password'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border1)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>zona bahaya</div>
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
                  fontWeight: 700, color: 'var(--red)', border: '1px solid #5a2020',
                  borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer',
                }}
              >
                keluar dari semua sesi
              </button>
            </div>
          </form>
        )}
      </ObsCard>
    </div>
  );
}
