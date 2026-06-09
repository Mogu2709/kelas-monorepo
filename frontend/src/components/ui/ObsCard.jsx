export default function ObsCard({ title, action, children }) {
  return (
    <div className="obs-card">
      {title && (
        <div className="obs-card__title">
          <span>▶ {title}</span>
          {action && <button className="obs-card__btn" onClick={action.onClick}>{action.label}</button>}
        </div>
      )}
      {children}
    </div>
  );
}
