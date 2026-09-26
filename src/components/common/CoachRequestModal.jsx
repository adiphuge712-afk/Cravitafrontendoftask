import { useState } from 'react';

/**
 * The two states of asking an admin for a coach: the form, or an
 * acknowledgement once a request is already on file. Purely presentational -
 * all state and API calls live in {@link module:hooks/useCoachRequest}, so
 * any page can drop this in and get the same behaviour.
 */
export default function CoachRequestModal({ coachRequest, onDismissAck, onDismissForm, showForm = true }) {
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  const { requestKnown, loading, hasRequested, submit, submitting, submitError } = coachRequest;

  if (!requestKnown || loading) return null;

  if (hasRequested) {
    if (dismissed) return null;
    return (
      <div className="ui-modal-backdrop">
        <div className="ui-modal">
          <div className="ui-modal__head">
            <h3 className="ui-modal__title">Request already sent</h3>
            <button
              type="button"
              className="ui-btn ui-btn--sm"
              aria-label="Close"
              onClick={() => { setDismissed(true); onDismissAck?.(); }}
            >
              ✕
            </button>
          </div>
          <div className="ui-modal__body">
            <p className="ui-muted">
              You have already sent a request. Please wait for admin approval — your dashboard
              will show your coach as soon as one is assigned.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showForm) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(message.trim());
    setMessage('');
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal">
        <div className="ui-modal__head">
          <h3 className="ui-modal__title">Request a coach</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ui-modal__body">
            {submitError && (
              <div className="ui-alert ui-alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                {submitError}
              </div>
            )}
            <div className="ui-field">
              <label className="ui-label" htmlFor="coach-request-message">
                Message to the admin
              </label>
              <textarea
                id="coach-request-message"
                className="ui-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the admin what kind of coach you're looking for…"
              />
            </div>
          </div>
          <div className="ui-modal__foot">
            {onDismissForm && (
              <button type="button" className="ui-btn" onClick={onDismissForm} disabled={submitting}>
                Maybe later
              </button>
            )}
            <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
