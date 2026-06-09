import { useApp } from '../../context/AppContext';
import ObsCard from '../ui/ObsCard';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import { useApi } from '../../hooks/useApi';
import { pengumumanApi, tugasApi, absensiApi, jadwalApi } from '../../lib/api';

const HARI_ID = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SectionDashboard() {
  const { kelas } = useApp();

  const { data: pengumuman } = useApi(() => pengumumanApi.list(), []);
  const { data: tugas }      = useApi(() => tugasApi.list(), []);
  const { data: absensi }    = useApi(() => absensiApi.list(), []);
  const { data: jadwal }     = useApi(() => jadwalApi.list(), []);

  const hariIni   = HARI_ID[new Date().getDay()];
  const jadwalHariIni = (jadwal ?? []).filter(j => j.hari.toLowerCase() === hariIni);
  const tugasAktif    = (tugas  ?? []).filter(t => t.status !== 'selesai');
  const tugasUrgent   = tugasAktif.filter(t => t.status === 'urgent');

  // Rata-rata kehadiran dari semua sesi
  const avgHadir = absensi?.length
    ? Math.round((absensi.reduce((s, a) => s + (a.hadir / a.total) * 100, 0)) / absensi.length)
    : null;

  return (
    <div className="section-content">
      {/* Stats row */}
      <div className="two-col">
        <ObsCard title="info-kelas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            <div className="ann-row__meta" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>Nama</span>&nbsp;&nbsp;
              <span style={{ color: 'var(--text1)', fontFamily: 'var(--font-mono)' }}>{kelas?.nama ?? '—'}</span>
            </div>
            <div className="ann-row__meta" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>Prodi</span>&nbsp;&nbsp;
              <span style={{ color: 'var(--text1)' }}>{kelas?.prodi ?? '—'}</span>
            </div>
            <div className="ann-row__meta" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>Mahasiswa</span>&nbsp;&nbsp;
              <span style={{ color: 'var(--text1)', fontFamily: 'var(--font-mono)' }}>
                {kelas?.totalMahasiswa ?? '—'}
                <span style={{ color: 'var(--green)', marginLeft: 8 }}>
                  {kelas?.onlineCount ?? 0} online
                </span>
              </span>
            </div>
            {avgHadir !== null && (
              <div style={{ marginTop: 4 }}>
                <div className="ann-row__meta" style={{ marginBottom: 4 }}>rata-rata kehadiran</div>
                <ProgressBar value={avgHadir} max={100} />
              </div>
            )}
          </div>
        </ObsCard>

        <ObsCard title="tugas-aktif">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tugasAktif.length === 0 && (
              <div className="mono-dim">tidak ada tugas aktif</div>
            )}
            {tugasAktif.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.judul}
                </span>
                <Badge label={t.status} />
              </div>
            ))}
            {tugasUrgent.length > 0 && (
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                ⚠ {tugasUrgent.length} tugas urgent
              </div>
            )}
          </div>
        </ObsCard>
      </div>

      {/* Jadwal hari ini */}
      <ObsCard title={`jadwal-hari-ini (${hariIni})`}>
        {jadwalHariIni.length === 0 ? (
          <div className="mono-dim">tidak ada kuliah hari ini</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jadwalHariIni.map(j => (
              <div key={j.id} className="sched-row">
                <div className="sched-row__time">{j.jamMulai}–{j.jamSelesai}</div>
                <div>
                  <div className="sched-row__name">{j.matkul?.nama}</div>
                  <div className="sched-row__meta">{j.ruang} &bull; {j.matkul?.dosen}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ObsCard>

      {/* Pengumuman terbaru */}
      <ObsCard title="pengumuman-terbaru">
        {(pengumuman ?? []).slice(0, 3).map(p => (
          <div key={p.id} className="ann-row ann-row--full">
            <Avatar inisial={p.author.inisial} color={p.author.color} size={28} />
            <div style={{ flex: 1 }}>
              <div className="ann-row__title">
                {p.judul} <Badge label={p.label} />
              </div>
              <div className="ann-row__meta">{formatTanggal(p.createdAt)} &bull; {p.author.nama}</div>
            </div>
          </div>
        ))}
        {(!pengumuman || pengumuman.length === 0) && (
          <div className="mono-dim">belum ada pengumuman</div>
        )}
      </ObsCard>
    </div>
  );
}
