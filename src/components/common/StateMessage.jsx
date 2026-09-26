/**
 * Empty and error states.
 *
 * Failures used to surface as `alert('fail to fetch data')`, which blocks the
 * page and tells the user nothing. This renders the problem in place and can
 * offer a retry.
 */
export default function StateMessage({ title, children, tone = 'empty', onRetry }) {
  return (
    <div className={tone === 'error' ? 'ui-state ui-state--error' : 'ui-state'}>
      <p className="ui-state__title">{title}</p>
      {children && <p className="ui-state__text">{children}</p>}
      {onRetry && (
        <button type="button" className="ui-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
