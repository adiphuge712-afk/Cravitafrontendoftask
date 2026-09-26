import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCheckCircle, FaClipboardList, FaFire, FaRegClock, FaUserPlus } from 'react-icons/fa';

import NavbarAthlete from '@/components/layout/NavbarAthlete';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import PerformanceTrendChart from '@/components/common/PerformanceTrendChart';
import CoachRequestModal from '@/components/common/CoachRequestModal';
import athleteApi from '@/api/athleteApi';
import useAuthUser from '@/hooks/useAuthUser';
import useCoachRequest from '@/hooks/useCoachRequest';
import useLiveEvents from '@/hooks/useLiveEvents';
import { isCompleted, parseLogDate } from '@/utils/performance';
import './AtheletDashboard.css';

// Local to this page on purpose - see the trend useMemo below for why.
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const AtheletDashboard = () => {
  const { user, ready } = useAuthUser();
  const athleteId = user?.athid;
  const coachId = user?.coachid?.coachid;
  const hasCoach = Boolean(user?.coachid);

  // The "request a coach" flow. This is the athlete's landing page after
  // login, so it is the one place a brand-new account is guaranteed to see
  // that nothing works yet without a coach - previously that prompt existed
  // only on the Schedule page, which nothing pointed a new athlete towards.
  const coachRequest = useCoachRequest(athleteId, hasCoach);
  const [formOpen, setFormOpen] = useState(false);
  const autoOpened = useRef(false);

  useEffect(() => {
    if (!autoOpened.current && !hasCoach && coachRequest.requestKnown && !coachRequest.hasRequested) {
      autoOpened.current = true;
      setFormOpen(true);
    }
  }, [hasCoach, coachRequest.requestKnown, coachRequest.hasRequested]);

  const [range, setRange] = useState({ date: '', date2: '' });
  const [workouts, setWorkouts] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const loadPerformance = useCallback(async () => {
    if (!athleteId) return;
    try {
      setPerformance(await athleteApi.getMyPerformanceLogs(athleteId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your performance history.');
    }
  }, [athleteId]);

  // Every drill the coach has ever set, independent of the date filter below
  // and independent of whether it has been logged yet - this is what the
  // completion stat cards are counted against, not just the logged rows.
  // Counting against logged rows alone made completion look like 100% the
  // moment an athlete had touched even one drill, since an unlogged drill
  // was not counted as pending - it was not counted at all.
  const loadAllWorkouts = useCallback(async () => {
    if (!coachId) return;
    try {
      setAllWorkouts(await athleteApi.getWorkoutsByCoach(coachId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your training drills.');
    }
  }, [coachId]);

  const loadWorkouts = useCallback(async () => {
    if (!coachId) return;
    setLoadingWorkouts(true);
    setError(null);
    try {
      const both = range.date && range.date2;
      setWorkouts(
        both
          ? await athleteApi.getWorkoutsBetween(coachId, range.date, range.date2)
          : await athleteApi.getTodaysWorkouts(coachId),
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your training schedule.');
      setWorkouts([]);
    } finally {
      setLoadingWorkouts(false);
    }
  }, [coachId, range.date, range.date2]);

  useEffect(() => { loadPerformance(); }, [loadPerformance]);
  useEffect(() => { loadAllWorkouts(); }, [loadAllWorkouts]);
  useEffect(() => { loadWorkouts(); }, [loadWorkouts]);

  // Live: ONE connection carrying every event this page cares about -
  // performance, schedule, and coach-request - instead of three separate
  // long-lived SSE streams. Three per tab was eating a large share of the
  // 6 concurrent HTTP/1.1 connections a browser allows per origin,
  // especially with more than one tab of this app open, which starved the
  // page's own data-fetching requests and showed up as the dashboard
  // hanging on its loading spinner. See Mycontroller.subscribeAllEvents.
  useLiveEvents(
    '/athelet/sse/events',
    (event, eventName) => {
      if (eventName === 'performance-updated') {
        loadPerformance();
      } else if (eventName === 'workout-added') {
        loadAllWorkouts();
        loadWorkouts();
      } else {
        coachRequest.handleLiveEvent(event);
      }
    },
    Boolean(athleteId),
  );

  const completedWorkIds = useMemo(
    () => new Set(performance.filter(isCompleted).map((p) => p?.workid?.workid)),
    [performance],
  );

  // Built from allWorkouts (every assigned drill), not from performance (only
  // logged rows) - the shared buildMonthlyTrend/utils/performance.js util
  // does the latter, which is exactly the bug this replaces: a newly assigned
  // drill has no log row yet, so it was invisible in the chart until someone
  // logged a result against it, at which point "total" and "completed" both
  // jumped by one in the same instant instead of "total" rising first. This
  // is deliberately local to this page rather than a change to that shared
  // util, which the admin dashboard, coach dashboard and coach's Performance
  // Log page all also use.
  const trend = useMemo(() => {
    const buckets = [];
    const now = new Date();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      buckets.push({ month: MONTH_LABELS[d.getMonth()], completed: 0, logged: 0, completionRate: 0 });
    }

    // A drill scheduled outside the visible 6-month window (further in the
    // future, or older) is clamped into the nearest edge bucket rather than
    // dropped - every drill must land somewhere, so this chart's totals
    // always match the "Total assigned drills" stat above instead of
    // silently undercounting whenever a drill's startdate falls outside
    // the window.
    for (const w of allWorkouts) {
      const date = parseLogDate(w?.startdate);
      if (!date) continue;

      const drillMonthIndex = date.getFullYear() * 12 + date.getMonth();
      const bucketIndex = Math.min(5, Math.max(0, drillMonthIndex - currentMonthIndex + 5));
      const bucket = buckets[bucketIndex];

      bucket.logged += 1;
      if (completedWorkIds.has(w.workid)) bucket.completed += 1;
    }

    for (const bucket of buckets) {
      bucket.completionRate = bucket.logged ? Math.round((bucket.completed / bucket.logged) * 100) : 0;
    }

    return buckets;
  }, [allWorkouts, completedWorkIds]);

  // Total drills, not total logged rows - see loadAllWorkouts above.
  const stats = useMemo(() => {
    const total = allWorkouts.length;
    const completed = allWorkouts.filter((w) => completedWorkIds.has(w.workid)).length;
    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [allWorkouts, completedWorkIds]);

  const markComplete = async (workId) => {
    setSavingId(workId);
    try {
      await athleteApi.markWorkoutComplete(athleteId, workId);
      await loadPerformance();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not mark that session complete.');
    } finally {
      setSavingId(null);
    }
  };

  if (!ready) return <Loader overlay label="Loading dashboard…" />;

  return (
    <>
      <NavbarAthlete />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Hi {user?.name || 'there'} 👋</h1>
            <p className="ui-page-subtitle">
              {user?.sporttype ? `${user.sporttype} · ` : ''}
              {user?.coachid?.name ? `Coached by ${user.coachid.name}` : 'No coach assigned yet'}
            </p>
          </div>
        </header>

        {coachRequest.coachAssignedLive ? (
          // hasCoach itself cannot update live - it is decoded from the JWT
          // issued at login, a snapshot the database change behind this event
          // does not touch. Refreshing re-fetches that token's owner data
          // fresh, which is the only way this page actually picks up the
          // change - so the honest thing here is to say so and offer that
          // refresh, not to pretend the dashboard already updated itself.
          <div className="ath-coach-banner">
            <div className="ath-coach-banner__text">
              <strong>A coach has just been assigned to you!</strong>
              <span>Refresh this page to see your dashboard update with your new coach.</span>
            </div>
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={() => window.location.reload()}
            >
              Refresh now
            </button>
          </div>
        ) : !hasCoach && (
          <div className="ath-coach-banner">
            <div className="ath-coach-banner__text">
              <strong>You don't have a coach yet.</strong>
              <span>
                {coachRequest.hasRequested
                  ? 'Your request is with the admin — this page will show your coach as soon as one is assigned.'
                  : 'Send a request to the admin and a coach will be assigned to you.'}
              </span>
            </div>
            {!coachRequest.hasRequested && (
              <button
                type="button"
                className="ui-btn ui-btn--primary"
                onClick={() => setFormOpen(true)}
              >
                <FaUserPlus aria-hidden="true" /> Request a coach
              </button>
            )}
          </div>
        )}

        <section className="ui-stat-grid">
          <StatCard icon={<FaClipboardList />} tone="primary" value={stats.total} label="Total drills" />
          <StatCard icon={<FaCheckCircle />} tone="success" value={stats.completed} label="Completed" />
          <StatCard icon={<FaRegClock />} tone="warning" value={stats.pending} label="Pending" />
          <StatCard icon={<FaFire />} tone="success" value={`${stats.completionRate}%`} label="Completion rate" />
        </section>

        {error && (
          <div className="ui-card">
            <div className="ui-card__body">
              <StateMessage title="Something went wrong" tone="error" onRetry={loadWorkouts}>
                {error}
              </StateMessage>
            </div>
          </div>
        )}

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">My completion trend</h2>
            <p className="ui-card__caption">Counted from your own session records</p>
          </div>
          <div className="ui-card__body">
            <PerformanceTrendChart
              series={trend}
              emptyHint="Once your coach assigns drills, your monthly trend will build up here."
              loggedLabel="Total assigned drills"
            />
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">
              {range.date && range.date2 ? 'Training in selected range' : "Today's training"}
            </h2>
            <div className="ath-date-filter">
              <label>
                From
                <input
                  type="date"
                  value={range.date}
                  onChange={(e) => setRange((r) => ({ ...r, date: e.target.value }))}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={range.date2}
                  onChange={(e) => setRange((r) => ({ ...r, date2: e.target.value }))}
                />
              </label>
              {(range.date || range.date2) && (
                <button type="button" className="ui-btn" onClick={() => setRange({ date: '', date2: '' })}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {!coachId ? (
            <div className="ui-card__body">
              <StateMessage title="No coach assigned yet">
                Your training schedule appears once an admin assigns you a coach.
              </StateMessage>
            </div>
          ) : loadingWorkouts ? (
            <div className="ui-card__body"><Loader label="Loading schedule…" /></div>
          ) : workouts.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="Nothing scheduled">
                No training drills for this {range.date && range.date2 ? 'date range' : 'day'}.
              </StateMessage>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Exercise</th>
                    <th>Plan</th>
                    <th>Duration</th>
                    <th>Starts</th>
                    <th>Ends</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map((w, index) => {
                    const done = completedWorkIds.has(w.workid);
                    return (
                      <tr key={w.workid}>
                        <td>{index + 1}</td>
                        <td>{w.workname}</td>
                        <td>{w.plan?.planname || '—'}</td>
                        <td>{w.duration} min</td>
                        <td>{w.plan?.startdate || '—'}</td>
                        <td>{w.plan?.enddate || '—'}</td>
                        <td>
                          {done ? (
                            <span className="ui-badge ui-badge--success">Completed</span>
                          ) : (
                            <button
                              type="button"
                              className="ui-btn ui-btn--primary"
                              onClick={() => markComplete(w.workid)}
                              disabled={savingId === w.workid}
                            >
                              {savingId === w.workid ? 'Saving…' : 'Mark complete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {!hasCoach && (
        <CoachRequestModal
          coachRequest={coachRequest}
          showForm={formOpen}
          onDismissForm={() => setFormOpen(false)}
        />
      )}
    </>
  );
};

export default AtheletDashboard;
