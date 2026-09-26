/**
 * A single headline number.
 *
 * Purely presentational: it renders whatever it is handed and never fetches
 * anything, so the same tile serves the admin, coach and athlete dashboards
 * (OCP - new tiles come from new props, not from editing this file).
 */
export default function StatCard({ icon, value, label, hint, tone = 'primary' }) {
  return (
    <div className="ui-stat">
      {icon && <span className={`ui-stat__icon ui-stat__icon--${tone}`}>{icon}</span>}
      <div>
        <p className="ui-stat__value">{value}</p>
        <p className="ui-stat__label">{label}</p>
        {hint && <p className="ui-stat__hint">{hint}</p>}
      </div>
    </div>
  );
}
