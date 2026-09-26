import { useMemo, useState } from 'react';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StateMessage from '@/components/common/StateMessage';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import './FeedbackHistory.css';

/** Difficulty is free text on the backend, so match loosely and fall back. */
function difficultyTone(level) {
  const value = String(level || '').toLowerCase();
  if (value.includes('easy')) return 'success';
  if (value.includes('medium') || value.includes('moderate')) return 'warning';
  if (value.includes('hard') || value.includes('difficult')) return 'danger';
  return 'neutral';
}

/**
 * Every complaint an athlete has filed, with the coach it concerns.
 *
 * Read-only, so the refactor is mostly subtraction: the duplicated token
 * block, the second `window.location.href = "/login"` guard and the
 * `alert('fail')` catch are all gone.
 */
const FeedbackHistory = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const feedback = useAsync(() => adminApi.getFeedback(), [], { enabled, initialData: [] });
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const list = feedback.data || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    return list.filter((d) =>
      [
        d?.comment,
        d?.difficultlevel,
        d?.athid?.name,
        d?.athid?.email,
        d?.athid?.coachid?.name,
        d?.athid?.coachid?.email,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [feedback.data, search]);

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Feedback history</h1>
            <p className="ui-page-subtitle">
              Complaints and difficulty ratings submitted by athletes about their coaching.
            </p>
          </div>
        </header>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Submitted feedback</h2>
            <p className="ui-card__caption">
              {feedback.loading ? 'Loading…' : `${rows.length} shown`}
            </p>
          </div>

          <div className="ui-card__body">
            <div className="ui-toolbar">
              <input
                type="search"
                className="ui-input ui-search"
                placeholder="Search comments, athletes or coaches"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search feedback"
              />
            </div>

            {feedback.loading ? (
              <Loader label="Loading feedback…" />
            ) : feedback.error ? (
              <StateMessage title="Could not load feedback" tone="error" onRetry={feedback.reload}>
                {feedback.error}
              </StateMessage>
            ) : (feedback.data?.length ?? 0) === 0 ? (
              <StateMessage title="No feedback submitted yet">
                When an athlete files a complaint about a session, it will be listed here.
              </StateMessage>
            ) : rows.length === 0 ? (
              <StateMessage title="No feedback matches that search">
                Nothing matched “{search}”. Clear the search box to see every entry.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table feedback-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Comment</th>
                      <th>Difficulty</th>
                      <th>Coach ID</th>
                      <th>Coach</th>
                      <th>Coach email</th>
                      <th>Athlete ID</th>
                      <th>Athlete</th>
                      <th>Athlete email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d, index) => (
                      <tr key={d.feedid}>
                        <td>{index + 1}</td>
                        <td className="feedback-comment" title={d.comment}>
                          {d.comment}
                        </td>
                        <td>
                          <span
                            className={`ui-badge ui-badge--${difficultyTone(d.difficultlevel)}`}
                          >
                            {d.difficultlevel || 'Not rated'}
                          </span>
                        </td>
                        <td>{d.athid?.coachid?.coachid ?? '—'}</td>
                        <td>{d.athid?.coachid?.name ? `${d.athid.coachid.name} Sir` : '—'}</td>
                        <td className="ui-muted">{d.athid?.coachid?.email || '—'}</td>
                        <td>{d.athid?.athid ?? '—'}</td>
                        <td>{d.athid?.name || '—'}</td>
                        <td className="ui-muted">{d.athid?.email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default FeedbackHistory;
