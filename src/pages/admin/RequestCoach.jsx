import { useMemo, useState } from 'react';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StateMessage from '@/components/common/StateMessage';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import useLiveEvents from '@/hooks/useLiveEvents';
import './RequestCoach.css';

/**
 * Athletes who have asked for a coach and do not have one yet.
 *
 * The filter is the point of the page, so it stays exactly as it was: only
 * requests whose athlete has no coach are listed. The two hand-rolled loading
 * overlays and the three alert() calls are replaced by <Loader/>,
 * <StateMessage/> and an inline banner.
 */
const RequestCoach = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const requests = useAsync(() => adminApi.getCoachRequests(), [], { enabled, initialData: [] });
  const coaches = useAsync(() => adminApi.getCoaches(), [], { enabled, initialData: [] });

  // Live: a new request or a coach assignment (from this page or elsewhere)
  // reloads the list, so the unassigned filter below stays current without
  // a manual refresh.
  useLiveEvents('/admin/sse/coach-requests', () => requests.reload(), enabled);

  const [assign, setAssign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone, text }

  // Same predicate as before: a request is outstanding while its athlete has
  // no coach attached.
  const unassigned = useMemo(
    () => (requests.data || []).filter((d) => !d?.athid?.coachid),
    [requests.data],
  );

  const openAssign = (d) => {
    setFeedback(null);
    setAssign({
      athid: d.athid.athid,
      name: d.athid.name,
      coachid: { coachid: d.coachid?.coachid || '' },
    });
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const message = await adminApi.assignCoach({
        athid: assign.athid,
        coachid: { coachid: assign.coachid.coachid },
      });

      setAssign(null);
      await requests.reload();
      setFeedback({
        tone: 'success',
        text:
          typeof message === 'string' && message.trim()
            ? message
            : `A coach was assigned to ${assign.name}.`,
      });
    } catch (err) {
      setFeedback({
        tone: 'error',
        text:
          err?.response?.data?.message ||
          err?.message ||
          'Could not assign that coach. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Coach requests</h1>
            <p className="ui-page-subtitle">
              Athletes waiting to be paired with a coach. A request disappears from this list once
              the athlete has one.
            </p>
          </div>
        </header>

        {feedback && (
          <div
            className={`ui-alert ui-alert--${feedback.tone === 'success' ? 'success' : 'error'} request-banner`}
            role="status"
          >
            <span>{feedback.text}</span>
          </div>
        )}

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Open requests</h2>
            <p className="ui-card__caption">
              {requests.loading ? 'Loading…' : `${unassigned.length} waiting`}
            </p>
          </div>

          <div className="ui-card__body">
            {requests.loading ? (
              <Loader label="Loading requests…" />
            ) : requests.error ? (
              <StateMessage title="Could not load requests" tone="error" onRetry={requests.reload}>
                {requests.error}
              </StateMessage>
            ) : unassigned.length === 0 ? (
              <StateMessage title="No requests waiting">
                Every athlete who asked for a coach already has one. New requests will show up here
                as soon as they are submitted.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Request</th>
                      <th>Athlete</th>
                      <th>Sport type</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassigned.map((d, index) => (
                      <tr key={d.rqid}>
                        <td>{index + 1}</td>
                        <td className="request-text" title={d.request}>
                          {d.request}
                        </td>
                        <td>{d.athid?.name || '—'}</td>
                        <td>{d.athid?.sporttype || '—'}</td>
                        <td className="ui-muted">{d.athid?.email || '—'}</td>
                        <td>{d.athid?.age || '—'}</td>
                        <td>
                          <div className="ui-row-actions">
                            <button
                              type="button"
                              className="ui-btn ui-btn--primary ui-btn--sm ui-nowrap"
                              onClick={() => openAssign(d)}
                              disabled={Boolean(d.athid?.coachid)}
                            >
                              {d.athid?.coachid ? 'Already assigned' : 'Assign coach'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {assign && (
        <div
          className="ui-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Assign a coach"
        >
          <div className="ui-modal">
            <div className="ui-modal__head">
              <h3 className="ui-modal__title">Assign a coach</h3>
              <button
                type="button"
                className="ui-btn ui-btn--sm"
                onClick={() => setAssign(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitAssign}>
              <div className="ui-modal__body">
                <p className="ui-muted request-modal-subject">
                  Athlete: <strong>{assign.name}</strong> (#{assign.athid})
                </p>

                <input type="hidden" name="athid" value={assign.athid} />

                <div className="ui-field">
                  <label className="ui-label" htmlFor="request-coach">Coach</label>
                  <select
                    id="request-coach"
                    name="coachid"
                    className="ui-select"
                    value={assign.coachid?.coachid || ''}
                    onChange={(e) =>
                      setAssign({ ...assign, coachid: { coachid: e.target.value } })
                    }
                    required
                  >
                    <option value="">Select Coach</option>
                    {(coaches.data || []).map((c) => (
                      <option key={c.coachid} value={c.coachid}>
                        {c.name} - {c.specialization}
                      </option>
                    ))}
                  </select>
                  {coaches.error && (
                    <span className="ui-field__error">
                      Coaches could not be loaded — {coaches.error}
                    </span>
                  )}
                  {!coaches.loading && !coaches.error && (coaches.data?.length ?? 0) === 0 && (
                    <span className="ui-field__error">
                      No coaches are registered yet. Register one first.
                    </span>
                  )}
                </div>
              </div>

              <div className="ui-modal__foot">
                <button type="button" className="ui-btn" onClick={() => setAssign(null)}>
                  Cancel
                </button>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={saving}>
                  {saving ? 'Processing…' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCoach;
