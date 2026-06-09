export default function ConfirmModal({ pesan, onConfirm, onCancel, loading = false }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal--confirm" onClick={e => e.stopPropagation()}>
        <div className="modal__title">konfirmasi</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', margin: '8px 0 20px' }}>{pesan}</p>
        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onCancel} disabled={loading}>
            batal
          </button>
          <button className="modal__btn modal__btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'menghapus...' : 'hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
