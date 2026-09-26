import { useMemo } from 'react';
import { FaComments, FaExclamationTriangle, FaUserFriends } from 'react-icons/fa';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import './FeedbackHistoryCoach.css';

const DIFFICULTY_TONE = {
  easy: 'success',
  low: 'success',
  medium: 'warning',
  moderate: 'warning',
  average: 'warning',
  hard: 'danger',
  difficult: 'danger',
  extreme: 'danger',
};

const difficultyClass = (value) =>
  `ui-badge ui-badge--${DIFFICULTY_TONE[String(value ?? '').toLowerCase()] || 'neutral'}`;

const isHard = (value) => DIFFICULTY_TONE[String(value ?? '').toLowerCase()] === 'danger';

/**
 * Athlete feedback, joined against this coach's performance logs so each
 * comment can be shown next to the drills and plans it relates to.
 */
const FeedBackHistoryCoach = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  const feedback = useAsync(() => coachApi.getFeedback(coachId), [coachId], {
    enabled,
    initialData: [],
  });
  const performance = useAsync(() => coachApi.getPerformanceLogs(coachId), [coachId], {
    enabled,
    initialData: [],
  });

  const loading = feedback.loading || performance.loading;
  const error = feedback.error || performance.error;

  const reloadAll = () => {
    feedback.reload();
    performance.reload();
  };

  // Each feedback row carries the athlete; the drills and plans it refers to
  // live in the performance logs, so match them on athlete id.
  const merged = useMemo(() => {
    const logs = Array.isArray(performance.data) ? performance.data : [];
    const rows = Array.isArray(feedback.data) ? feedback.data : [];

    return rows.map((item) => ({
      ...item,
      performances: logs.filter(
        (p) =>
          p?.athid?.athid === item?.athid?.athid &&
          p?.workid?.plan?.coachid?.coachid === coachId,
      ),
    }));
  }, [feedback.data, performance.data, coachId]);

  const athleteCount = useMemo(
    () => new Set(merged.map((c) => c?.athid?.athid).filter(Boolean)).size,
    [merged],
  );

  const hardCount = useMemo(() => merged.filter((c) => isHard(c.difficultlevel)).length, [merged]);

  if (!ready) return <Loader overlay label="Checking your session…" />;

  const listState = !enabled ? (
    <StateMessage title="Coach profile incomplete">
      Your sign-in token carries no coach id, so feedback cannot be loaded. Signing out and back in
      usually fixes this.
    </StateMessage>
  ) : loading ? (
    <Loader label="Loading feedback…" />
  ) : error ? (
    <StateMessage title="Could not load feedback" tone="error" onRetry={reloadAll}>
      {error}
    </StateMessage>
  ) : merged.length === 0 ? (
    <StateMessage title="No feedback from your athletes yet">
      Athletes submit feedback against the drills you assign them. As soon as one does, the comment
      and its difficulty rating appear here.
    </StateMessage>
  ) : null;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Athlete feedback overview</h1>
            <p className="ui-page-subtitle">
              What your athletes said about the drills they were given
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaComments />}
            tone="primary"
            value={loading ? '—' : merged.length}
            label="Feedback entries"
          />
          <StatCard
            icon={<FaUserFriends />}
            tone="success"
            value={loading ? '—' : athleteCount}
            label="Athletes who replied"
          />
          <StatCard
            icon={<FaExclamationTriangle />}
            tone="danger"
            value={loading ? '—' : hardCount}
            label="Rated hard"
            hint={merged.length ? 'Consider easing these plans' : undefined}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Feedback history</h2>
            <p className="ui-card__caption">{loading ? 'Loading…' : `${merged.length} comments`}</p>
          </div>

          {listState ? (
            <div className="ui-card__body">{listState}</div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Comment</th>
                    <th>Difficulty</th>
                    <th>Athlete ID</th>
                    <th>Name</th>
                    <th>Sport</th>
                    <th>Work</th>
                    <th>Plan</th>
                  </tr>
                </thead>

                <tbody>
                  {merged.map((c, index) => (
                    <tr key={c.feedid}>
                      <td className="ui-muted">{index + 1}</td>

                      <td className="feedback-comment">{c.comment}</td>

                      <td>
                        <span className={difficultyClass(c.difficultlevel)}>
                          {c.difficultlevel || 'N/A'}
                        </span>
                      </td>

                      <td className="ui-nowrap">{c.athid?.athid ?? '—'}</td>
                      <td>{c.athid?.name ?? '—'}</td>

                      <td>
                        <span className="ui-badge ui-badge--neutral">
                          {c.athid?.sporttype || 'Unassigned'}
                        </span>
                      </td>

                      <td>
                        {c.performances.length > 0
                          ? c.performances.map((p) => p.workid?.workname).filter(Boolean).join(', ')
                          : <span className="ui-muted">No Work</span>}
                      </td>

                      <td>
                        {c.performances.length > 0
                          ? [...new Set(
                              c.performances.map((p) => p.workid?.plan?.planname).filter(Boolean),
                            )].join(', ')
                          : <span className="ui-muted">No Plan</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default FeedBackHistoryCoach;
