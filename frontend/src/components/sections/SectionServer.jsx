import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import { kelasApi } from '../../lib/api';
import { useMutation } from '../../hooks/useMutation';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

export default function SectionServer() {
  const { kelas, refreshKelas } = useApp();

  const [form, setForm] = useState({
    nama:  kelas?.nama  ?? '',
    prodi: kelas?.prodi ?? '',
    vault: kelas?.vault ?? '',
  });
  const [msg, setMsg] = useState(null);

  const bannerRef = useRef(null);
  const iconRef   = useRef(null);

  const { mutate: updateKelas,   loading: saving }          = useMutation(kelasApi.update);
  const { mutate: uploadBanner,  loading: uploadingBanner } = useMutation(kelasApi.uploadBanner);
  const { mutate: uploadIcon,    loading: uploadingIcon }   = useMutation(kelasApi.uploadIcon);

  const bannerUrl = kelas?.bannerUrl
    ? (kelas.bannerUrl.startsWith('http') ? kelas.bannerUrl : `${BASE_URL}${kelas.bannerUrl}`)
    : null;
  const iconUrl = kelas?.iconUrl
    ? (kelas.iconUrl.startsWith('http') ? kelas.iconUrl : `${BASE_URL}${kelas.iconUrl}`)
    : null;

  async function handleSave(e) {
    e.preventDefault();
    setMsg(null);
    const result = await updateKelas(form);
    if (!result.ok) { setMsg({ type: 'err', text: result.error ?? 'Gagal menyimpan.' }); return; }
    if (refreshKelas) await refreshKelas();
    setMsg({ type: 'ok', text: 'Pengaturan server disimpan.' });
  }

  async function handleBannerChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'Ukuran banner maksimal 5MB.' });
      return;
    }
    const fd = new FormData();
    fd.append('banner', file);
    const result = await uploadBanner(fd);
    if (!result.ok) { setMsg({ type: 'err', text: result.error ?? 'Gagal upload banner.' }); return; }
    if (refreshKelas) await refreshKelas();
    setMsg({ type: 'ok', text: 'Banner server diperbarui.' });
  }

  async function handleIconChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'Ukuran icon maksimal 2MB.' });
      return;
    }
    const fd = new FormData();
    fd.append('icon', file);
    const result = await uploadIcon(fd);
    if (!result.ok) { setMsg({ type: 'err', text: result.error ?? 'Gagal upload icon.' }); return; }
    if (refreshKelas) await refreshKelas();
    setMsg({ type: 'ok', text: 'Icon server diperbarui.' });
  }

  return (
    <div className="section-content">
      {/* Banner preview */}
      <ObsCard title="tampilan-server">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 120,
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: bannerUrl ? 'none' : 'linear-gradient(135deg, var(--bg3), var(--bg4))',
            marginBottom: 16,
            border: '1px solid var(--border1)',
          }}
        >
          {bannerUrl ? (
            <img src={bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              belum ada banner
            </div>
          )}
          <button
            onClick={() => bannerRef.current?.click()}
            disabled={uploadingBanner}
            style={{
              position: 'absolute', top: 8, right: 8,
              padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            {uploadingBanner ? 'mengunggah…' : '✎ ganti banner'}
          </button>
          <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
        </div>

        {/* Icon server */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: iconUrl ? 'none' : 'var(--accent)',
              overflow: 'hidden', border: '2px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {iconUrl ? (
                <img src={iconUrl} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                  {kelas?.nama?.[0] ?? 'K'}
                </span>
              )}
            </div>
            <button
              onClick={() => iconRef.current?.click()}
              disabled={uploadingIcon}
              style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--accent)', border: 'none', cursor: 'pointer',
                fontSize: 10, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {uploadingIcon ? '…' : '✎'}
            </button>
            <input ref={iconRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleIconChange} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>{kelas?.nama}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{kelas?.prodi}</div>
          </div>
        </div>
      </ObsCard>

      {/* Form edit info server */}
      <ObsCard title="info-server">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="form-label">
            nama server / kelas
            <input
              className="form-input"
              value={form.nama}
              onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
              placeholder="IF-A 2024"
            />
          </label>
          <label className="form-label">
            program studi
            <input
              className="form-input"
              value={form.prodi}
              onChange={e => setForm(f => ({ ...f, prodi: e.target.value }))}
              placeholder="Teknik Informatika"
            />
          </label>
          <label className="form-label">
            vault / kode kelas
            <input
              className="form-input"
              value={form.vault}
              onChange={e => setForm(f => ({ ...f, vault: e.target.value }))}
              placeholder="kelas-if-2024-a"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
            />
            <span style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'block' }}>
              kode unik yang digunakan sebagai identifier server
            </span>
          </label>

          {msg && (
            <div style={{ fontSize: 12, color: msg.type === 'ok' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
              {msg.type === 'ok' ? '✓' : '✗'} {msg.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'menyimpan…' : 'simpan pengaturan'}
            </button>
          </div>
        </form>
      </ObsCard>

      {/* Info tambahan */}
      <ObsCard title="info-teknis">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          {[
            ['ID Kelas',   kelas?.id],
            ['Total Matkul', kelas?.mataKuliah?.length ?? '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text2)' }}>
              <span style={{ color: 'var(--text3)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text1)', fontSize: 11 }}>{val}</span>
            </div>
          ))}
        </div>
      </ObsCard>
    </div>
  );
}
