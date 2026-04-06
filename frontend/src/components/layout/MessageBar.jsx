import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { chatApi } from '../../lib/api';

export default function MessageBar() {
  const { activeChannel, setActiveChannel } = useApp();
  const [unread, setUnread] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const pollingRef = useRef(null);

  // Kalau lagi di channel chat, tidak perlu tampil
  const isOnChat = activeChannel === 'chat';

  const fetchCount = useCallback(async () => {
    if (isOnChat) { setUnread(0); return; }
    try {
      const data = await chatApi.list({ limit: 50 });
      setLastCount(prev => {
        const prevIds = new Set();
        // gunakan closure count saja
        if (data.length > prev) {
          setUnread(u => u + (data.length - prev));
        }
        return data.length;
      });
    } catch { /* abaikan */ }
  }, [isOnChat]);

  useEffect(() => {
    fetchCount();
    pollingRef.current = setInterval(fetchCount, 5000);
    return () => clearInterval(pollingRef.current);
  }, [fetchCount]);

  // Reset unread saat masuk channel chat
  useEffect(() => {
    if (isOnChat) setUnread(0);
  }, [isOnChat]);

  if (isOnChat) return null;

  return (
    <div className="msgbar">
      <button
        className="msgbar__toggle"
        onClick={() => { setUnread(0); setActiveChannel('chat'); }}
        title="Buka chat kelas"
      >
        💬
        {unread > 0 && (
          <span className="msgbar__badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      <input
        className="msgbar__input"
        type="text"
        placeholder="Klik 💬 atau ketik untuk buka chat kelas"
        onFocus={() => { setUnread(0); setActiveChannel('chat'); }}
        readOnly
        style={{ cursor: 'pointer' }}
      />
      <button
        className="msgbar__btn"
        onClick={() => { setUnread(0); setActiveChannel('chat'); }}
      >
        Chat
      </button>
    </div>
  );
}

