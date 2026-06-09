import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { chatApi } from '../../lib/api';
import Avatar from '../ui/Avatar';

// Format waktu singkat: "14:32" atau "kemarin 14:32"
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hhmm = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return isToday ? hhmm : `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${hhmm}`;
}

export default function MessageBar() {
  const { activeChannel, currentUser, role } = useApp();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg]           = useState('');
  const [sending, setSending]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [unread, setUnread]     = useState(0);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollingRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await chatApi.list({ limit: 50 });
      setMessages(prev => {
        const newCount = data.length - prev.length;
        if (!open && newCount > 0) setUnread(u => u + newCount);
        return data;
      });
    } catch {
      // abaikan error polling
    }
  }, [open]);

  // Polling setiap 3 detik
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages]);

  // Scroll ke bawah setiap messages berubah dan chat terbuka
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Reset unread saat buka chat
  function toggleOpen() {
    setOpen(o => {
      if (!o) setUnread(0);
      return !o;
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleSend() {
    const text = msg.trim();
    if (!text || sending) return;
    setSending(true);
    setMsg('');
    try {
      const newMsg = await chatApi.send(text);
      setMessages(prev => [...prev, newMsg]);
    } catch {
      setMsg(text); // kembalikan teks jika gagal
    } finally {
      setSending(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  async function handleDelete(id) {
    try {
      await chatApi.remove(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch { /* abaikan */ }
  }

  const isAdmin = role === 'admin';

  return (
    <>
      {/* Chat panel — muncul di atas msgbar */}
      {open && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <span style={{ fontWeight: 700, fontSize: 11 }}># umum — chat kelas</span>
            <button className="chat-panel__close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-panel__messages">
            {messages.length === 0 && (
              <div className="mono-dim" style={{ padding: '20px 0', textAlign: 'center' }}>
                belum ada pesan. mulai percakapan!
              </div>
            )}
            {messages.map((m, i) => {
              const isMine  = m.author?.id === currentUser?.id;
              const showAvatar = i === 0 || messages[i - 1]?.author?.id !== m.author?.id;
              return (
                <div key={m.id} className={`chat-msg ${isMine ? 'chat-msg--mine' : ''}`}>
                  {showAvatar && !isMine && (
                    <Avatar
                      inisial={m.author?.inisial ?? '?'}
                      color={m.author?.color ?? '#7c5cbf'}
                      size={26}
                    />
                  )}
                  {!showAvatar && !isMine && <div style={{ width: 26, flexShrink: 0 }} />}
                  <div className="chat-msg__body">
                    {showAvatar && (
                      <div className="chat-msg__meta">
                        <span className="chat-msg__author">{m.author?.nama ?? '?'}</span>
                        {m.author?.role === 'admin' && (
                          <span style={{ fontSize: 9, color: 'var(--purple3)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>admin</span>
                        )}
                        <span className="chat-msg__time">{formatTime(m.createdAt)}</span>
                      </div>
                    )}
                    <div className="chat-msg__bubble">
                      {m.isi}
                      {(isMine || isAdmin) && (
                        <button
                          className="chat-msg__del"
                          onClick={() => handleDelete(m.id)}
                          title="Hapus pesan"
                        >✕</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Msgbar di bawah */}
      <div className="msgbar">
        <button
          className={`msgbar__toggle ${open ? 'msgbar__toggle--active' : ''}`}
          onClick={toggleOpen}
          title="Buka chat kelas"
        >
          💬
          {unread > 0 && !open && (
            <span className="msgbar__badge">{unread > 9 ? '9+' : unread}</span>
          )}
        </button>
        <input
          ref={inputRef}
          className="msgbar__input"
          type="text"
          placeholder={open ? `Pesan ke #umum...` : `Klik 💬 untuk buka chat kelas`}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => { if (!open) { setOpen(true); setUnread(0); } }}
          disabled={sending}
        />
        <button
          className="msgbar__btn"
          onClick={handleSend}
          disabled={!msg.trim() || sending}
        >
          {sending ? '...' : 'Kirim'}
        </button>
      </div>
    </>
  );
}