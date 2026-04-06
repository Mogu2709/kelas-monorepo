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

const sectionMap = {
  dashboard:  <SectionDashboard />,
  pengumuman: <SectionPengumuman />,
  tugas:      <SectionTugas />,
  materi:     <SectionMateri />,
  jadwal:     <SectionJadwal />,
  absensi:    <SectionAbsensi />,
  mahasiswa:  <SectionMahasiswa />,
};

function MainContent() {
  const { activeChannel } = useApp();
  return sectionMap[activeChannel] ?? null;
}

export default function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg0)', color: 'var(--text3)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        loading...
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  return (
    <div className="app">
      <ServerRail />
      <Sidebar />
      <div className="main">
        <TopBar />
        <div className="main__content">
          <MainContent />
        </div>
        <MessageBar />
      </div>
    </div>
  );
}
