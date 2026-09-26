/**
 * One spinner for the whole app.
 *
 * The same eight-line loader markup was pasted into every page; this is it,
 * once. `overlay` covers the viewport for blocking waits, otherwise it sits
 * inline inside whatever card is loading.
 */
export default function Loader({ label = 'Loading…', overlay = false }) {
  return (
    <div className={overlay ? 'ui-loader ui-loader--overlay' : 'ui-loader'} role="status" aria-live="polite">
      <div className="ui-loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
