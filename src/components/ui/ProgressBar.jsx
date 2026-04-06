export default function ProgressBar({ value, max = 100, color = '#7c5cbf' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a09bb5', minWidth: 32 }}>{pct}%</span>
      <div style={{ flex: 1, height: 4, background: '#252535', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
