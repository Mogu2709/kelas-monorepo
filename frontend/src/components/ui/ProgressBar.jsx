export default function ProgressBar({ value, max = 100, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = color ?? (pct === 100 ? 'var(--green)' : pct >= 75 ? 'var(--purple)' : pct >= 50 ? 'var(--purple2)' : 'var(--yellow)');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

