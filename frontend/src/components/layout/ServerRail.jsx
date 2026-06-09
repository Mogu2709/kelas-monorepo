import { useApp } from '../../context/AppContext';

export default function ServerRail() {
  const { kelas } = useApp();

  const inisial = kelas?.nama
    ? kelas.nama.split('-').slice(0, 2).join('').toUpperCase().slice(0, 2)
    : 'IF';

  return (
    <div className="server-rail">
      <div className="server-icon server-icon--active" title={kelas?.nama ?? '…'}>
        {inisial}
      </div>
      <div className="server-rail__sep" />
      <div className="server-icon" style={{ background: '#4ecdc4' }} title={kelas?.prodi ?? '…'}>
        {kelas?.prodi?.slice(0, 2).toUpperCase() ?? 'TI'}
      </div>
    </div>
  );
}