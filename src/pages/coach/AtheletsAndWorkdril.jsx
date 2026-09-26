import { useMemo, useState } from 'react';
import { FaClipboardCheck, FaDumbbell, FaUsers } from 'react-icons/fa';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import useLiveEvents from '@/hooks/useLiveEvents';
import { isCompleted } from '@/utils/performance';
import './AtheletsAndWorkdrilsstyle.css';
import './AtheletsAndWorkdirl.css';

const INTENSITY_TONE = {
  low: 'success',
  medium: 'warning',
  hard: 'danger',
};

const intensityClass = (value) =>
  `ui-badge ui-badge--${INTENSITY_TONE[String(value ?? '').toLowerCase()] || 'neutral'}`;

/**
 * Records a performance result for one athlete against one work drill.
 *
 * The athlete roster, the drills and the existing performance logs are three
 * separate reads; the logs decide whether saving is a create or an update, and
 * the backend route for both is /{athleteId}/{workId} - athlete id first.
 */
const AtheletsAndWorkdril = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  const athletes = useAsync(() => coachApi.getMyAthletes(coachId), [coachId], {
    enabled,
    initialData: [],
  });
  const workouts = useAsync(() => coachApi.getWorkouts(coachId), [coachId], {
    enabled,
    initialData: [],
  });
  const logs = useAsync(() => coachApi.getPerformanceLogs(coachId), [coachId], {
    enabled,
    initialData: [],
  });

  // Live: ONE connection carrying both performance and schedule events,
  // instead of two - see CoachDashboard.jsx for the full reasoning. A new
  // drill (from this coach's own other tabs) or a result recorded anywhere
  // (including an athlete marking their own drill complete) reloads this
  // page's "existing vs new" status per row without a manual refresh.
  useLiveEvents(
    '/coach/sse/events',
    (event, eventName) => {
      if (eventName === 'performance-updated') {
        logs.reload();
      } else if (eventName === 'workout-added') {
        workouts.reload();
      }
    },
    enabled,
  );

  const [performance, setperformance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);      // page-level { tone, text }
  const [modalError, setModalError] = useState('');

  const athleteRows = useMemo(
    () => (Array.isArray(athletes.data) ? athletes.data : []),
    [athletes.data],
  );
  const workRows = useMemo(() => (Array.isArray(workouts.data) ? workouts.data : []), [workouts.data]);
  const logRows = useMemo(() => (Array.isArray(logs.data) ? logs.data : []), [logs.data]);

  // Filters which athlete sections and which drill columns are shown below -
  // the stat tiles above still count everyone and everything, not just what
  // is currently visible.
  const [athleteFilter, setAthleteFilter] = useState('');
  const [workFilter, setWorkFilter] = useState('');

  const filteredAthleteRows = useMemo(() => {
    const query = athleteFilter.trim().toLowerCase();
    if (!query) return athleteRows;
    return athleteRows.filter((a) => (a?.name || '').toLowerCase().includes(query));
  }, [athleteRows, athleteFilter]);

  const filteredWorkRows = useMemo(() => {
    const query = workFilter.trim().toLowerCase();
    if (!query) return workRows;
    return workRows.filter((w) => (w?.workname || '').toLowerCase().includes(query));
  }, [workRows, workFilter]);

  // Fast athlete+drill -> existing log lookup, so the button can say whether
  // saving will create or overwrite.
  const logIndex = useMemo(() => {
    const map = new Map();
    for (const p of logRows) {
      if (p?.athid?.athid != null && p?.workid?.workid != null) {
        map.set(`${p.athid.athid}::${p.workid.workid}`, p);
      }
    }
    return map;
  }, [logRows]);

  const existingLog = (athid, workid) => logIndex.get(`${athid}::${workid}`);

  const loading = athletes.loading || workouts.loading || logs.loading;
  const error = athletes.error || workouts.error || logs.error;

  const reloadAll = () => {
    athletes.reload();
    workouts.reload();
    logs.reload();
  };

  const perpormance = (id, wid) => {
    const current = existingLog(id, wid);
    setModalError('');
    setNotice(null);
    setperformance({
      athid: id,
      workid: wid,
      athleteName: athleteRows.find((a) => a.athid === id)?.name || '',
      workName: workRows.find((w) => w.workid === wid)?.workname || '',
      existing: Boolean(current),
      performancematrix: current?.performancematrix || '',
      fatiquelevel: current?.fatiquelevel || '',
      completestatus: current?.completestatus || '',
    });
  };

  const formsubmitperformanse = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      completestatus: performance.completestatus,
      performancematrix: performance.performancematrix,
      fatiquelevel: performance.fatiquelevel,
    };

    setSubmitting(true);
    setModalError('');

    try {
      // Athlete id first in both routes - the backend maps /{athleteId}/{workId}.
      if (existingLog(performance.athid, performance.workid)) {
        await coachApi.updatePerformance(performance.athid, performance.workid, payload);
        setNotice({ tone: 'success', text: 'Performance updated.' });
      } else {
        await coachApi.addPerformance(performance.athid, performance.workid, payload);
        setNotice({ tone: 'success', text: 'Performance recorded.' });
      }

      setperformance(null);
      logs.reload();
    } catch (err) {
      setModalError(
        err?.response?.data?.message ||
          err?.message ||
          'The performance could not be saved. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  const pageState = !enabled ? (
    <StateMessage title="Coach profile incomplete">
      Your sign-in token carries no coach id, so your athletes and drills cannot be loaded. Signing
      out and back in usually fixes this.
    </StateMessage>
  ) : loading ? (
    <Loader label="Loading athletes and work drills…" />
  ) : error ? (
    <StateMessage title="Could not load this page" tone="error" onRetry={reloadAll}>
      {error}
    </StateMessage>
  ) : athleteRows.length === 0 ? (
    <StateMessage title="No athletes assigned yet">
      An admin assigns athletes to you. Once you have some, you can log their drill results here.
    </StateMessage>
  ) : workRows.length === 0 ? (
    <StateMessage title="No work drills created yet">
      Add a work drill to one of your training plans from the Training Plans page, then come back to
      record results against it.
    </StateMessage>
  ) : filteredAthleteRows.length === 0 ? (
    <StateMessage title="No athletes match this filter">
      Try a different athlete name, or clear the filter to see everyone.
    </StateMessage>
  ) : filteredWorkRows.length === 0 ? (
    <StateMessage title="No drills match this filter">
      Try a different drill name, or clear the filter to see every drill.
    </StateMessage>
  ) : null;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Athlete work management</h1>
            <p className="ui-page-subtitle">
              Record how each athlete performed on the drills in your plans
            </p>
          </div>
        </header>

        {notice && (
          <div className={`ui-alert ui-alert--${notice.tone} workdril__notice`} role="status">
            {notice.text}
          </div>
        )}

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaUsers />}
            tone="primary"
            value={loading ? '—' : athleteRows.length}
            label="My athletes"
          />
          <StatCard
            icon={<FaDumbbell />}
            tone="warning"
            value={loading ? '—' : workRows.length}
            label="Work drills"
          />
          <StatCard
            icon={<FaClipboardCheck />}
            tone="success"
            value={loading ? '—' : logRows.length}
            label="Results recorded"
            hint={
              !loading && athleteRows.length && workRows.length
                ? `of ${athleteRows.length * workRows.length} possible`
                : undefined
            }
          />
        </section>

        {!loading && !error && athleteRows.length > 0 && workRows.length > 0 && (
          <section className="ui-card">
            <div className="ui-card__body ui-filter-bar">
              <div className="ui-field">
                <label className="ui-label" htmlFor="workdril-athlete-filter">Athlete name</label>
                <input
                  id="workdril-athlete-filter"
                  className="ui-input"
                  type="text"
                  placeholder="Filter by athlete name"
                  value={athleteFilter}
                  onChange={(e) => setAthleteFilter(e.target.value)}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="workdril-filter">Drill name</label>
                <input
                  id="workdril-filter"
                  className="ui-input"
                  type="text"
                  placeholder="Filter by drill name"
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                />
              </div>
              {(athleteFilter || workFilter) && (
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => {
                    setAthleteFilter('');
                    setWorkFilter('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </section>
        )}

        {pageState ? (
          <section className="ui-card">
            <div className="ui-card__body">{pageState}</div>
          </section>
        ) : (
          filteredAthleteRows.map((d) => (
            <section className="ui-card" key={d.athid}>
              <div className="ui-card__head workdril__athlete-head">
                <div>
                  <h2 className="ui-card__title">{d.name}</h2>
                  <p className="ui-card__caption">
                    ID {d.athid}
                    {d.age ? ` · ${d.age} yrs` : ''}
                    {d.email ? ` · ${d.email}` : ''}
                  </p>
                </div>
                <span className="ui-badge ui-badge--neutral">{d.sporttype || 'Unassigned'}</span>
              </div>

              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Workout</th>
                      <th>Duration</th>
                      <th>Intensity</th>
                      <th>Plan</th>
                      <th>Result</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWorkRows.map((w, i) => {
                      const log = existingLog(d.athid, w.workid);
                      return (
                        <tr key={w.workid}>
                          <td className="ui-muted">{i + 1}</td>
                          <td>{w.workname}</td>
                          <td className="ui-nowrap">{w.duration} Min</td>
                          <td>
                            <span className={intensityClass(w.intencity)}>{w.intencity || '—'}</span>
                          </td>
                          <td>{w.plan?.planname || '—'}</td>
                          <td>
                            {log ? (
                              <span
                                className={`ui-badge ui-badge--${
                                  isCompleted(log) ? 'success' : 'warning'
                                }`}
                              >
                                {log.completestatus || 'Logged'}
                              </span>
                            ) : (
                              <span className="ui-badge ui-badge--neutral">Not logged</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`ui-btn ui-btn--sm ui-nowrap${log ? '' : ' ui-btn--primary'}`}
                              onClick={() => perpormance(d.athid, w.workid)}
                            >
                              {log ? 'Update performance' : 'Add performance'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>

      {/* Performance modal */}
      {performance && (
        <div
          className="ui-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Record performance"
        >
          <div className="ui-modal">
            <form onSubmit={formsubmitperformanse}>
              <div className="ui-modal__head">
                <div>
                  <h3 className="ui-modal__title">
                    {performance.existing ? 'Update performance' : 'Add performance'}
                  </h3>
                  <p className="ui-card__caption">
                    {performance.athleteName}
                    {performance.workName ? ` · ${performance.workName}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="ui-btn ui-btn--sm"
                  onClick={() => setperformance(null)}
                  aria-label="Close"
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              <div className="ui-modal__body ui-form">
                {modalError && <div className="ui-alert ui-alert--error">{modalError}</div>}

                <div className="ui-field">
                  <label className="ui-label" htmlFor="perf-matrix">Performance</label>
                  <select
                    id="perf-matrix"
                    className="ui-select"
                    value={performance.performancematrix}
                    onChange={(e) =>
                      setperformance({ ...performance, performancematrix: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Performance</option>
                    <option value="Low">Low</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="High">High</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="perf-fatigue">Fatigue</label>
                  <select
                    id="perf-fatigue"
                    className="ui-select"
                    value={performance.fatiquelevel}
                    onChange={(e) =>
                      setperformance({ ...performance, fatiquelevel: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Fatigue</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="perf-status">Status</label>
                  <select
                    id="perf-status"
                    className="ui-select"
                    value={performance.completestatus || ''}
                    onChange={(e) =>
                      setperformance({ ...performance, completestatus: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Completed">Not Completed</option>
                  </select>
                </div>
              </div>

              <div className="ui-modal__foot">
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => setperformance(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
                  {submitting ? 'Processing…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AtheletsAndWorkdril;
