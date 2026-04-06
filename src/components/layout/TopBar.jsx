import { useApp } from '../../context/AppContext';

const channelMeta = {
  dashboard:  'ringkasan kelas',
  pengumuman: 'broadcast dari admin & dosen',
  tugas:      'kelola & pantau pengumpulan',
  materi:     'materi-modul · vault kelas',
  jadwal:     'jadwal kuliah mingguan',
  absensi:    'rekap kehadiran per pertemuan',
  mahasiswa:  'daftar anggota · admin only',
};

export default function TopBar() {
  const { activeChannel, kelas } = useApp();

  return (
    <div className="topbar">
      <div className="topbar__left">
        <span className="topbar__hash">#</span>
        <span className="topbar__title">{activeChannel}</span>
        {channelMeta[activeChannel] && (
          <span className="topbar__desc">{channelMeta[activeChannel]}</span>
        )}
      </div>
      <div className="topbar__right">
        <span className="topbar__meta">
          {kelas?.totalMahasiswa ?? '—'} anggota &bull; {kelas?.onlineCount ?? '—'} online
        </span>
      </div>
    </div>
  );
}