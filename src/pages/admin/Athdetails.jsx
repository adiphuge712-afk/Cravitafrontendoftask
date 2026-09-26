import { useMemo, useState } from 'react';
import { FaUserCheck, FaUserClock, FaUsers } from 'react-icons/fa';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import './Athdetails.css';

/**
 * Athlete roster plus the "assign a coach" action.
 *
 * The identity block, the axios URLs and the alert() calls that used to live
 * here are gone: useAuthUser owns the token, adminApi owns the endpoints and
 * the result of an assignment is reported inline so nothing blocks the page.
 */
const Athdetails = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const athletes = useAsync(() => adminApi.getAthletes(), [], { enabled, initialData: [] });
  const coaches = useAsync(() => adminApi.getCoaches(), [], { enabled, initialData: [] });

  // `assign` doubles as "is the modal open" and as the payload being edited.
  const [assign, setAssign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone: 'success' | 'error', text }
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const list = athletes.data || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    return list.filter((a) =>
      [a?.name, a?.email, a?.sporttype, a?.coachid?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [athletes.data, search]);

  const assignedCount = useMemo(
    () => (athletes.data || []).filter((a) => a?.coachid).length,
    [athletes.data],
  );

  const openAssign = (athlete) => {
    setFeedback(null);
    setAssign({
      athid: athlete.athid,
      name: athlete.name,
      coachid: { coachid: athlete.coachid?.coachid || '' },
    });
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // The backend takes an Athelet body, so only these two fields travel.
      const message = await adminApi.assignCoach({
        athid: assign.athid,
        coachid: { coachid: assign.coachid.coachid },
      });

      setAssign(null);
      await athletes.reload();
      setFeedback({
        tone: 'success',
        text: typeof message === 'string' && message.trim() ? message : 'Coach assigned.',
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
            <h1 className="ui-page-title">Athletes</h1>
            <p className="ui-page-subtitle">
              Every registered athlete and the coach they are currently assigned to.
            </p>
          </div>
        </header>

        {feedback && (
          <div
            className={`ui-alert ui-alert--${feedback.tone === 'success' ? 'success' : 'error'} ath-banner`}
            role="status"
          >
            <span>{feedback.text}</span>
          </div>
        )}

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaUsers />}
            tone="primary"
            value={athletes.loading ? '—' : (athletes.data?.length ?? 0)}
            label="Athletes"
          />
          <StatCard
            icon={<FaUserCheck />}
            tone="success"
            value={athletes.loading ? '—' : assignedCount}
            label="With a coach"
          />
          <StatCard
            icon={<FaUserClock />}
            tone="warning"
            value={athletes.loading ? '—' : (athletes.data?.length ?? 0) - assignedCount}
            label="Awaiting a coach"
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Athlete list</h2>
            <p className="ui-card__caption">
              {athletes.loading ? 'Loading…' : `${rows.length} shown`}
            </p>
          </div>

          <div className="ui-card__body">
            <div className="ui-toolbar">
              <input
                type="search"
                className="ui-input ui-search"
                placeholder="Search by name, email, sport or coach"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search athletes"
              />
            </div>

            {athletes.loading ? (
              <Loader label="Loading athletes…" />
            ) : athletes.error ? (
              <StateMessage title="Could not load athletes" tone="error" onRetry={athletes.reload}>
                {athletes.error}
              </StateMessage>
            ) : (athletes.data?.length ?? 0) === 0 ? (
              <StateMessage title="No athletes registered yet">
                Athletes appear here as soon as they sign up for the academy.
              </StateMessage>
            ) : rows.length === 0 ? (
              <StateMessage title="No athletes match that search">
                Nothing matched “{search}”. Clear the search box to see the full roster.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Sport</th>
                      <th>Age</th>
                      <th>Coach</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d, index) => (
                      <tr key={d.athid}>
                        <td>{index + 1}</td>
                        <td>{d.name}</td>
                        <td className="ui-muted">{d.email}</td>
                        <td>{d.sporttype || '—'}</td>
                        <td>{d.age || '—'}</td>
                        <td>
                          {d.coachid ? (
                            <span className="ui-badge ui-badge--success">
                              {d.coachid.name || `Coach #${d.coachid.coachid}`}
                            </span>
                          ) : (
                            <span className="ui-badge ui-badge--warning">Not assigned</span>
                          )}
                        </td>
                        <td>
                          <div className="ui-row-actions">
                            <button
                              type="button"
                              className="ui-btn ui-btn--primary ui-btn--sm ui-nowrap"
                              onClick={() => openAssign(d)}
                            >
                              {d.coachid ? 'Change coach' : 'Assign coach'}
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

            <form className="ui-form" onSubmit={submitAssign}>
              <div className="ui-modal__body">
                <p className="ui-muted ath-modal-subject">
                  Athlete: <strong>{assign.name}</strong> (#{assign.athid})
                </p>

                <input type="hidden" name="athid" value={assign.athid} />

                <div className="ui-field">
                  <label className="ui-label" htmlFor="assign-coach">
                    Coach
                  </label>
                  <select
                    id="assign-coach"
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
                  {saving ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Athdetails;
