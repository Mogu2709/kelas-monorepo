const variants = {
  penting:  'badge--red',
  urgent:   'badge--red',
  info:     'badge--blue',
  baru:     'badge--blue',
  jadwal:   'badge--yellow',
  aktif:    'badge--green',
  selesai:  'badge--green',
  done:     'badge--green',
  perhatian:'badge--yellow',
  rendah:   'badge--red',
  'admin only': 'badge--purple',
  purple:   'badge--purple',
  gray:     'badge--gray',
};

export default function Badge({ label, variant }) {
  const cls = variant ? `badge--${variant}` : (variants[label] ?? 'badge--gray');
  return <span className={`badge ${cls}`}>{label}</span>;
}
