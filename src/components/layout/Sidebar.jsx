import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { channels } from '../../data';
import Avatar from '../ui/Avatar';

export default function Sidebar() {
  const { role, activeChannel, setActiveChannel, currentUser, kelas } = useApp();
  const { logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__server-name">{kelas?.nama ?? '…'} <span>▾</span></div>
        <div className="sidebar__vault">vault: {kelas?.vault ?? '…'}</div>
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
                  onClick={() => setActiveChannel(ch.id)}
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

      <div className="sidebar__user">
        <Avatar
          inisial={currentUser?.inisial ?? '?'}
          color={currentUser?.color ?? '#7c5cbf'}
          size={30}
          status="online"
        />
        <div className="sidebar__user-info">
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