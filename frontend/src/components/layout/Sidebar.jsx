import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

// Konfigurasi navigasi sidebar
const channels = [
  {
    group: 'informasi',
    items: [
      { id: 'dashboard',  label: 'dashboard'  },
      { id: 'pengumuman', label: 'pengumuman' },
      { id: 'jadwal',     label: 'jadwal'      },
    ],
  },
  {
    group: 'akademik',
    items: [
      { id: 'tugas',   label: 'tugas'      },
      { id: 'materi',  label: 'materi'     },
      { id: 'absensi', label: 'absensi'    },
      { id: 'matkul',  label: 'mata-kuliah', adminOnly: true },
    ],
  },
  {
    group: 'komunitas',
    items: [
      { id: 'chat',      label: 'general'    },
      { id: 'mahasiswa', label: 'mahasiswa', adminOnly: true },
    ],
  },
  {
    group: 'akun',
    items: [
      { id: 'profil', label: 'profil-saya' },
    ],
  },
  {
    group: 'admin',
    items: [
      { id: 'server', label: 'kelola-server', adminOnly: true },
    ],
  },
];

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

export default function Sidebar({ open, onClose }) {
  const { role, activeChannel, setActiveChannel, currentUser, kelas } = useApp();
  const { logout } = useAuth();

  const avatarUrl = currentUser?.avatarUrl
    ? (currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `${BASE_URL}${currentUser.avatarUrl}`)
    : null;

  const iconUrl = kelas?.iconUrl
    ? (kelas.iconUrl.startsWith('http') ? kelas.iconUrl : `${BASE_URL}${kelas.iconUrl}`)
    : null;

  function handleChannelClick(id) {
    setActiveChannel(id);
    onClose?.(); // tutup drawer di mobile
  }

  return (
    <div className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div
        className="sidebar__header"
        style={{ cursor: role === 'admin' ? 'pointer' : 'default' }}
        onClick={() => { if (role === 'admin') handleChannelClick('server'); }}
        title={role === 'admin' ? 'Kelola server' : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {iconUrl && (
            <img
              src={iconUrl}
              alt="icon"
              style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div>
            <div className="sidebar__server-name">
              {kelas?.nama ?? '…'}
              {role === 'admin' && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>▾</span>}
            </div>
            <div className="sidebar__vault">vault: {kelas?.vault ?? '…'}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {channels.map(group => {
          const visibleItems = group.items.filter(
            ch => !(ch.adminOnly && role === 'mahasiswa')
          );
          if (!visibleItems.length) return null;
          return (
            <div key={group.group} className="channel-group">
              <div className="channel-group__label">■ {group.group}</div>
              {visibleItems.map(ch => (
                <button
                  key={ch.id}
                  className={`channel-item ${activeChannel === ch.id ? 'channel-item--active' : ''}`}
                  onClick={() => handleChannelClick(ch.id)}
                >
                  <span className="channel-item__hash">
                    {ch.adminOnly ? '🔒' : '#'}
                  </span>
                  {ch.label}
                  {ch.notif && <span className="channel-item__notif" />}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User bar bawah */}
      <div className="sidebar__user">
        <button
          onClick={() => handleChannelClick('profil')}
          title="Lihat profil saya"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: 30, height: 30, borderRadius: '50%',
                objectFit: 'cover',
                border: activeChannel === 'profil' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            />
          ) : (
            <Avatar
              inisial={currentUser?.inisial ?? '?'}
              color={currentUser?.color ?? '#7c5cbf'}
              size={30}
              status="online"
            />
          )}
        </button>

        <div
          className="sidebar__user-info"
          style={{ cursor: 'pointer' }}
          onClick={() => handleChannelClick('profil')}
          title="Lihat profil saya"
        >
          <div className="sidebar__user-name">{currentUser?.nama ?? '—'}</div>
          <div className="sidebar__user-tag">
            {currentUser?.tag} &bull; {role}
          </div>
        </div>

        <button
          onClick={logout}
          title="Keluar"
          style={{
            flexShrink: 0,
            padding: '4px 8px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text3)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'color 0.1s, border-color 0.1s',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.borderColor = '#5a2020';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text3)';
            e.currentTarget.style.borderColor = 'var(--border2)';
          }}
        >
          OUT
        </button>
      </div>
    </div>
  );
}
