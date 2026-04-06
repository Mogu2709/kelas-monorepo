import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { chatApi } from '../../lib/api';
import Avatar from '../ui/Avatar';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === d.toDateString();
  const hhmm = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (isToday)     return hhmm;
  if (isYesterday) return `kemarin ${hhmm}`;
  return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${hhmm}`;
}

export default function SectionChat() {
  const { currentUser, role } = useApp();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg]           = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollingRef = useRef(null);
  const isAdmin = role === 'admin';

  const fetchMessages = useCallback(async () => {
    try {
      const data = await chatApi.list({ limit: 50 });
      setMessages(data);
    } catch {
      // abaikan error polling
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling setiap 3 detik
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages]);

  // Scroll ke bawah saat pertama load & pesan baru masuk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input saat section dibuka
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function handleSend() {
    const text = msg.trim();
    if (!text || sending) return;
    setSending(true);
    setMsg('');
    try {
      const newMsg = await chatApi.send(text);
      setMessages(prev => [...prev, newMsg]);
    } catch {
      setMsg(text);
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

  function getAvatarUrl(author) {
    if (!author?.avatarUrl) return null;
    return author.avatarUrl.startsWith('http')
      ? author.avatarUrl
      : `${BASE_URL}${author.avatarUrl}`;
  }

  return (
    <div className="chat-page">
      {/* Area pesan */}
      <div className="chat-page__messages">
        {loading && (
          <div className="mono-dim" style={{ textAlign: 'center', padding: 24 }}>memuat pesan...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="chat-page__empty">
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Belum ada pesan</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Jadilah yang pertama memulai percakapan!</div>
          </div>
        )}

        {messages.map((m, i) => {
          const isMine     = m.author?.id === currentUser?.id;
          const prevMsg    = messages[i - 1];
          const showHeader = i === 0 || prevMsg?.author?.id !== m.author?.id;
          const avatarUrl  = getAvatarUrl(m.author);

          return (
            <div
              key={m.id}
              className={`chat-page__msg ${isMine ? 'chat-page__msg--mine' : ''} ${!showHeader ? 'chat-page__msg--cont' : ''}`}
            >
              {/* Avatar — hanya tampil di pesan pertama dari user yang sama */}
              <div className="chat-page__msg-avatar">
                {showHeader && !isMine && (
                  avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    : <Avatar inisial={m.author?.inisial ?? '?'} color={m.author?.color ?? '#7c5cbf'} size={32} />
                )}
              </div>

              <div className="chat-page__msg-body">
                {showHeader && (
                  <div className="chat-page__msg-meta">
                    {!isMine && (
                      <span className="chat-page__msg-author" style={{ color: m.author?.color ?? 'var(--text1)' }}>
                        {m.author?.nama ?? '?'}
                      </span>
                    )}
                    {m.author?.role === 'admin' && (
                      <span className="chat-page__msg-role">admin</span>
                    )}
                    <span className="chat-page__msg-time">{formatTime(m.createdAt)}</span>
                  </div>
                )}

                <div className="chat-page__bubble-wrap">
                  <div className="chat-page__bubble">
                    {m.isi}
                  </div>
                  {(isMine || isAdmin) && (
                    <button
                      className="chat-page__del"
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

      {/* Input bar */}
      <div className="chat-page__input-bar">
        <input
          ref={inputRef}
          className="chat-page__input"
          type="text"
          placeholder="Pesan ke #umum..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={handleKey}
          disabled={sending}
          maxLength={2000}
        />
        <button
          className="chat-page__send"
          onClick={handleSend}
          disabled={!msg.trim() || sending}
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}
