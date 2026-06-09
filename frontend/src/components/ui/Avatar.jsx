const statusColors = {
  online: '#43b581',
  idle:   '#faa61a',
  dnd:    '#f04747',
  offline:'#747f8d',
};

export default function Avatar({ inisial, color = '#7c5cbf', size = 28, status, fontSize }) {
  const fs = fontSize ?? Math.round(size * 0.38);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fs, fontWeight: 700, color: '#fff',
      }}>
        {inisial}
      </div>
      {status && (
        <div style={{
          width: size * 0.3, height: size * 0.3,
          borderRadius: '50%',
          background: statusColors[status] ?? '#747f8d',
          border: '2px solid #191928',
          position: 'absolute', bottom: -1, right: -1,
        }} />
      )}
    </div>
  );
}
