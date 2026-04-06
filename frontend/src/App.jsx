import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import ServerRail from './components/layout/ServerRail';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MessageBar from './components/layout/MessageBar';

import SectionDashboard  from './components/sections/SectionDashboard';
import SectionPengumuman from './components/sections/SectionPengumuman';
import SectionTugas      from './components/sections/SectionTugas';
import SectionMateri     from './components/sections/SectionMateri';
import SectionJadwal     from './components/sections/SectionJadwal';
import SectionAbsensi    from './components/sections/SectionAbsensi';
import SectionMahasiswa  from './components/sections/SectionMahasiswa';
import SectionMatkul     from './components/sections/SectionMatkul';
import SectionProfile    from './components/sections/SectionProfile';
import SectionServer     from './components/sections/SectionServer';
import SectionChat       from './components/sections/SectionChat';

const sectionMap = {
  dashboard:  <SectionDashboard />,
  pengumuman: <SectionPengumuman />,
  tugas:      <SectionTugas />,
  materi:     <SectionMateri />,
  jadwal:     <SectionJadwal />,
  absensi:    <SectionAbsensi />,
  mahasiswa:  <SectionMahasiswa />,
  chat:       <SectionChat />,
  matkul:     <SectionMatkul />,
  profil:     <SectionProfile />,
  server:     <SectionServer />,
};

function MainContent({ onChat }) {
  const { activeChannel } = useApp();
  return sectionMap[activeChannel] ?? null;
}

export default function App() {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg0)', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--purple)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 900, color: '#fff',
        }}>IF</div>
        <div style={{
          color: 'var(--text3)', fontFamily: 'var(--font-mono)',
          fontSize: 11, letterSpacing: '0.06em',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>memuat sesi...</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  return (
    <AppInner sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  );
}

function AppInner({ sidebarOpen, setSidebarOpen }) {
  const { activeChannel } = useApp();
  const isChat = activeChannel === 'chat';

  return (
    <div className="app">
      <ServerRail />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
        <div className={`main__content ${isChat ? 'main__content--chat' : ''}`}>
          <MainContent />
        </div>
        <MessageBar />
      </div>
    </div>
  );
}
