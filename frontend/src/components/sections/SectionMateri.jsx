import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import ConfirmModal from '../ui/ConfirmModal';
import { useApi, useMutation } from '../../hooks/useApi';
import { materiApi, kelasApi } from '../../lib/api';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

const tipeIkon = { PDF: '📄', PPTX: '📊', MP4: '🎬', DRAWIO: '🔷', DOCX: '📝', ZIP: '🗜️', OTHER: '📁' };

function FormMateri({ onClose, onSuccess, initial = null }) {
  const isEdit = !!initial;

  // Field untuk edit
  const [nama, setNama]     = useState(initial?.nama   ?? '');
  const [tipe, setTipe]     = useState(initial?.tipe   ?? 'PDF');
  const [url, setUrl]       = useState(initial?.url    ?? '');

  // Field untuk create — pilih mode
  const [mode, setMode]     = useState('file'); // 'file' | 'url'
  const [matkulId, setMatkulId] = useState(initial?.matkul?.id ?? '');
  const [file, setFile]     = useState(null);
  const [validErr, setValidErr] = useState('');
  const fileRef = useRef(null);

  const { data: matkulList } = useApi(() => kelasApi.matkul(), []);

  // useMutation tidak cocok untuk upload FormData, kita handle manual
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit() {
    setValidErr('');
    setError('');

    if (isEdit) {
      // Edit: hanya update metadata (nama, url)
      if (!nama.trim()) { setValidErr('Nama tidak boleh kosong.'); return; }
      setLoading(true);
      try {
        await materiApi.update(initial.id, { nama: nama.trim(), url: url || null });
        onSuccess();
        onClose();
      } catch (e) {
        setError(e.message ?? 'Gagal menyimpan.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Create
    if (!matkulId) { setValidErr('Pilih mata kuliah terlebih dahulu.'); return; }

    if (mode === 'file') {
      if (!file) { setValidErr('Pilih file terlebih dahulu.'); return; }
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('matkulId', matkulId);
        if (nama.trim()) fd.append('nama', nama.trim());
        await materiApi.uploadFile(fd);
        onSuccess();
        onClose();
      } catch (e) {
        setError(e.message ?? 'Gagal upload.');
      } finally {
        setLoading(false);
      }
    } else {
      // Mode URL eksternal
      if (!nama.trim()) { setValidErr('Nama file tidak boleh kosong.'); return; }
      setLoading(true);
      try {
        await materiApi.createUrl({ nama: nama.trim(), tipe, matkulId, url: url || null });
        onSuccess();
        onClose();
      } catch (e) {
        setError(e.message ?? 'Gagal menyimpan.');
      } finally {
        setLoading(false);
      }
    }
  }

  const tipeList = ['PDF', 'PPTX', 'MP4', 'DRAWIO', 'DOCX', 'ZIP', 'OTHER'];
  const displayError = validErr || error;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__title">{isEdit ? 'edit materi' : 'upload materi'}</div>

        {!isEdit && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={`modal__btn ${mode === 'file' ? 'modal__btn--submit' : 'modal__btn--cancel'}`}
              style={{ flex: 1, fontSize: 11 }}
              onClick={() => setMode('file')}
            >📁 Upload File</button>
            <button
              className={`modal__btn ${mode === 'url' ? 'modal__btn--submit' : 'modal__btn--cancel'}`}
              style={{ flex: 1, fontSize: 11 }}
              onClick={() => setMode('url')}
            >🔗 URL Eksternal</button>
          </div>
        )}

        {!isEdit && mode === 'file' && (
          <div
            className="modal__dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            {file
              ? <span style={{ color: 'var(--text1)', fontWeight: 600 }}>{file.name} ({(file.size/1048576).toFixed(1)}MB)</span>
              : <span>klik atau drag & drop file di sini<br/><span style={{ fontSize: 10, color: 'var(--text3)' }}>PDF, PPTX, DOCX, MP4, ZIP, DRAWIO — maks 100MB</span></span>
            }
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              accept=".pdf,.pptx,.ppt,.docx,.doc,.mp4,.zip,.drawio"
              onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }}
            />
          </div>
        )}

        <input
          className="modal__input"
          placeholder={mode === 'file' && !isEdit ? 'nama file (opsional, diisi otomatis)' : 'nama file'}
          value={nama}
          onChange={e => { setNama(e.target.value); setValidErr(''); }}
        />

        {!isEdit && (
          <select className="modal__input" value={matkulId} onChange={e => { setMatkulId(e.target.value); setValidErr(''); }}>
            <option value="">— pilih mata kuliah —</option>
            {(matkulList ?? []).map(m => (
              <option key={m.id} value={m.id}>{m.nama}</option>
            ))}
          </select>
        )}

        {(mode === 'url' || isEdit) && (
          <>
            {!isEdit && (
              <select className="modal__input" value={tipe} onChange={e => setTipe(e.target.value)}>
                {tipeList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
            <input
              className="modal__input"
              placeholder="url download / link (opsional)"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </>
        )}

        {displayError && <div className="modal__error">{displayError}</div>}

        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>batal</button>
          <button className="modal__btn modal__btn--submit" onClick={handleSubmit} disabled={loading}>
            {loading
              ? (mode === 'file' && !isEdit ? 'mengupload...' : 'menyimpan...')
              : isEdit ? 'simpan' : 'upload'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function MateriCard({ matkul, items, isAdmin, onEdit, onHapus }) {
  return (
    <ObsCard title={matkul}>
      {items.map(m => {
        const isLocal = m.url?.startsWith('/uploads/');
        const href    = isLocal ? `${BASE_URL}${m.url}` : m.url;
        return (
          <div key={m.id} className="mat-row">
            <div className="mat-row__icon">{tipeIkon[m.tipe] ?? '📁'}</div>
            <div style={{ flex: 1 }}>
              <div className="mat-row__name">
                {m.nama}
                {m.baru && <span className="new-pill">new</span>}
              </div>
              <div className="mat-row__meta">{m.tipe} &bull; {m.ukuran || '—'}</div>
            </div>
            {href
              ? <a className="dl-btn" href={href} target="_blank" rel="noreferrer" download={isLocal ? m.nama : undefined}>↓ get</a>
              : <button className="dl-btn" disabled title="URL tidak tersedia">get</button>
            }
            {isAdmin && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="del-btn" style={{ color: 'var(--text3)' }} onClick={() => onEdit(m)}>✎</button>
                <button className="del-btn" onClick={() => onHapus(m.id)}>✕</button>
              </div>
            )}
          </div>
        );
      })}
      {items.length === 0 && <div className="mono-dim">belum ada materi</div>}
    </ObsCard>
  );
}

export default function SectionMateri() {
  const { role } = useApp();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { data, loading, error, refetch } = useApi(() => materiApi.list(), []);
  const { mutate: hapus } = useMutation((id) => materiApi.remove(id));

  async function handleHapus() {
    const { ok } = await hapus(confirmId);
    if (ok) { refetch(); setConfirmId(null); }
  }

  const grouped = (data ?? []).reduce((acc, m) => {
    const key = m.matkul?.nama ?? 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="section-content">
      {showForm && <FormMateri onClose={() => setShowForm(false)} onSuccess={refetch} />}
      {editItem  && <FormMateri onClose={() => setEditItem(null)} onSuccess={refetch} initial={editItem} />}
      {confirmId && (
        <ConfirmModal
          pesan="Yakin hapus materi ini? File juga akan dihapus dari server."
          onConfirm={handleHapus}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="modal__btn modal__btn--submit" onClick={() => setShowForm(true)}>
            + upload materi
          </button>
        </div>
      )}
      {loading && <div className="mono-dim">memuat...</div>}
      {error   && <div className="mono-dim">gagal memuat: {error}</div>}
      {!loading && !error && Object.keys(grouped).length === 0 && (
        <div className="mono-dim" style={{ padding: 20 }}>Belum ada materi yang diunggah.</div>
      )}
      <div className="two-col">
        {Object.entries(grouped).map(([matkul, items]) => (
          <MateriCard
            key={matkul}
            matkul={matkul}
            items={items}
            isAdmin={isAdmin}
            onEdit={setEditItem}
            onHapus={setConfirmId}
          />
        ))}
      </div>
    </div>
  );
}
