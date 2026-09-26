import { useMemo, useState } from 'react';
import { FaChartLine, FaCheckCircle, FaUsers, FaUserTie } from 'react-icons/fa';

import NavbarAdmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import PerformanceTrendChart from '@/components/common/PerformanceTrendChart';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import useLiveEvents from '@/hooks/useLiveEvents';
import { buildMonthlyTrend, isCompleted, summarisePerformance } from '@/utils/performance';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const athletes = useAsync(() => adminApi.getAthletes(), [], { enabled, initialData: [] });
  const coaches = useAsync(() => adminApi.getCoaches(), [], { enabled, initialData: [] });
  const performance = useAsync(() => adminApi.getPerformanceLogs(), [], { enabled, initialData: [] });
  const workouts = useAsync(() => adminApi.getWorkouts(), [], { enabled, initialData: [] });

  // Live: ONE connection carrying every event this dashboard cares about,
  // instead of three separate long-lived streams. Browsers cap concurrent
  // HTTP/1.1 connections to one origin at 6; three on this single page,
  // stacked with whatever coach and athlete pages are open in other tabs,
  // could exhaust that budget and stall ordinary page loads - see
  // /athelet/sse/events for the same fix and the full reasoning.
  useLiveEvents(
    '/admin/sse/events',
    (event, eventName) => {
      if (eventName === 'performance-updated') {
        performance.reload();
      } else if (eventName === 'workout-added') {
        workouts.reload();
      } else if (eventName === 'request-submitted' || eventName === 'coach-assigned') {
        athletes.reload();
      }
    },
    enabled,
  );

  // Both the chart and the tiles are derived from the logs the API returned.
  const trend = useMemo(() => buildMonthlyTrend(performance.data), [performance.data]);
  const stats = useMemo(() => summarisePerformance(performance.data), [performance.data]);

  const assignedCount = useMemo(
    () => (athletes.data || []).filter((a) => a?.coachid).length,
    [athletes.data],
  );

  // One row per coach: their own squad, their own drills, and a completion
  // rate counted the same way the athlete dashboard counts its own - against
  // every drill assigned to that squad, not just the ones someone logged.
  // An unlogged drill still counts as a pending assignment, so a coach with
  // one completed log out of twenty possible athlete/drill pairs shows 5%,
  // not 100%. Each squad member also carries their own completed/pending
  // count against that same denominator (their coach's own drill count),
  // for the per-athlete columns in the table below.
  const coachBreakdown = useMemo(() => {
    const athleteList = athletes.data || [];
    const workoutList = workouts.data || [];
    const logList = performance.data || [];

    return (coaches.data || []).map((coach) => {
      const rawSquad = athleteList.filter((a) => a?.coachid?.coachid === coach.coachid);
      const drills = workoutList.filter((w) => w?.plan?.coachid?.coachid === coach.coachid);
      const drillIds = new Set(drills.map((w) => w.workid));

      const squad = rawSquad.map((athlete) => {
        const completedCount = logList.filter(
          (log) => log?.athid?.athid === athlete.athid && drillIds.has(log?.workid?.workid) && isCompleted(log),
        ).length;
        return { ...athlete, completedCount, pendingCount: drills.length - completedCount };
      });

      const totalAssignments = squad.length * drills.length;
      const completedAssignments = squad.reduce((sum, a) => sum + a.completedCount, 0);

      return {
        coach,
        squad,
        drillCount: drills.length,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
      };
    });
  }, [coaches.data, athletes.data, workouts.data, performance.data]);

  // Filters narrow which coach cards, and which athletes within them, are
  // shown - the completion figures on each card still summarise that coach's
  // whole squad, not just the rows currently visible.
  const [coachNameFilter, setCoachNameFilter] = useState('');
  const [athleteNameFilter, setAthleteNameFilter] = useState('');
  const breakdownFilterActive = Boolean(coachNameFilter || athleteNameFilter);

  const visibleCoachBreakdown = useMemo(() => {
    const coachQuery = coachNameFilter.trim().toLowerCase();
    const athleteQuery = athleteNameFilter.trim().toLowerCase();
    if (!coachQuery && !athleteQuery) return coachBreakdown;

    return coachBreakdown
      .filter((entry) => !coachQuery || (entry.coach.name || '').toLowerCase().includes(coachQuery))
      .map((entry) => ({
        ...entry,
        visibleSquad: athleteQuery
          ? entry.squad.filter((a) => (a.name || '').toLowerCase().includes(athleteQuery))
          : entry.squad,
      }))
      // Only drop a coach for having no matching athletes when an athlete
      // name was actually searched for - otherwise every coach with an empty
      // squad would vanish the moment only the coach-name field is used.
      .filter((entry) => !athleteQuery || entry.visibleSquad.length > 0);
  }, [coachBreakdown, coachNameFilter, athleteNameFilter]);

  const breakdownLoading = coaches.loading || athletes.loading || workouts.loading || performance.loading;
  const breakdownError = coaches.error || athletes.error || workouts.error || performance.error;

  if (!ready || (enabled && athletes.loading && coaches.loading)) {
    return <Loader overlay label="Loading dashboard…" />;
  }

  return (
    <>
      <NavbarAdmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Academy overview</h1>
            <p className="ui-page-subtitle">
              Signed in as {user?.name || 'Admin'} · every figure below is read live from the database
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaUserTie />}
            tone="primary"
            value={coaches.loading ? '—' : (coaches.data?.length ?? 0)}
            label="Coaches"
          />
          <StatCard
            icon={<FaUsers />}
            tone="success"
            value={athletes.loading ? '—' : (athletes.data?.length ?? 0)}
            label="Athletes"
            hint={`${assignedCount} with a coach assigned`}
          />
          <StatCard
            icon={<FaChartLine />}
            tone="warning"
            value={performance.loading ? '—' : stats.total}
            label="Performance records"
          />
          <StatCard
            icon={<FaCheckCircle />}
            tone="success"
            value={performance.loading ? '—' : `${stats.completionRate}%`}
            label="Drill completion"
            hint={`${stats.completed} of ${stats.total} completed`}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Training completion — last 6 months</h2>
            <p className="ui-card__caption">Counted from recorded performance logs</p>
          </div>
          <div className="ui-card__body">
            {performance.loading ? (
              <Loader label="Loading performance data…" />
            ) : performance.error ? (
              <StateMessage title="Could not load performance data" tone="error" onRetry={performance.reload}>
                {performance.error}
              </StateMessage>
            ) : (
              <PerformanceTrendChart series={trend} />
            )}
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Coaches &amp; squad completion</h2>
            <p className="ui-card__caption">
              Each coach's own athletes and drills, with completion counted against every
              athlete/drill pair - an unlogged drill still counts as pending, not as skipped.
            </p>
          </div>

          {!breakdownLoading && !breakdownError && coachBreakdown.length > 0 && (
            <div className="ui-card__body ui-filter-bar">
              <div className="ui-field">
                <label className="ui-label" htmlFor="breakdown-coach-filter">Coach name</label>
                <input
                  id="breakdown-coach-filter"
                  className="ui-input"
                  type="text"
                  placeholder="Filter by coach name"
                  value={coachNameFilter}
                  onChange={(e) => setCoachNameFilter(e.target.value)}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="breakdown-athlete-filter">Athlete name</label>
                <input
                  id="breakdown-athlete-filter"
                  className="ui-input"
                  type="text"
                  placeholder="Filter by athlete name"
                  value={athleteNameFilter}
                  onChange={(e) => setAthleteNameFilter(e.target.value)}
                />
              </div>
              {breakdownFilterActive && (
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => {
                    setCoachNameFilter('');
                    setAthleteNameFilter('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {breakdownLoading ? (
            <div className="ui-card__body"><Loader label="Loading coaches…" /></div>
          ) : breakdownError ? (
            <div className="ui-card__body">
              <StateMessage title="Could not load coach breakdown" tone="error" onRetry={coaches.reload}>
                {breakdownError}
              </StateMessage>
            </div>
          ) : coachBreakdown.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No coaches registered yet">
                Coaches appear here as soon as an admin registers one.
              </StateMessage>
            </div>
          ) : visibleCoachBreakdown.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No coaches or athletes match this filter">
                Try a different name, or clear the filters to see everyone.
              </StateMessage>
            </div>
          ) : (
            <div className="admin-coach-breakdown">
              {visibleCoachBreakdown.map(({ coach, squad, visibleSquad, drillCount, completedAssignments, totalAssignments, completionRate }) => {
                const rows = visibleSquad ?? squad;
                return (
                <div className="admin-coach-card" key={coach.coachid}>
                  <div className="admin-coach-card__head">
                    <div>
                      <h3>{coach.name}</h3>
                      <p className="ui-muted">
                        {coach.specialization || 'No specialization set'}
                        {coach.email ? ` · ${coach.email}` : ''}
                      </p>
                    </div>
                    <span
                      className={`ui-badge ui-badge--${
                        completionRate >= 70 ? 'success' : completionRate >= 30 ? 'warning' : 'danger'
                      }`}
                    >
                      {completionRate}% complete
                    </span>
                  </div>

                  <p className="ui-muted admin-coach-card__meta">
                    {squad.length} athlete{squad.length === 1 ? '' : 's'} · {drillCount} drill
                    {drillCount === 1 ? '' : 's'} · {completedAssignments} of {totalAssignments} assignments done
                    {rows.length !== squad.length ? ` · ${rows.length} shown` : ''}
                  </p>

                  {squad.length === 0 ? (
                    <p className="ui-muted">No athletes assigned to this coach yet.</p>
                  ) : (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead>
                          <tr>
                            <th>Athlete</th>
                            <th>Sport</th>
                            <th>Age</th>
                            <th>Email</th>
                            <th>Completed</th>
                            <th>Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((athlete) => (
                            <tr key={athlete.athid}>
                              <td>{athlete.name}</td>
                              <td>{athlete.sporttype || '—'}</td>
                              <td>{athlete.age || '—'}</td>
                              <td>{athlete.email || '—'}</td>
                              <td>
                                <span className="ui-badge ui-badge--success">{athlete.completedCount}</span>
                              </td>
                              <td>
                                <span className="ui-badge ui-badge--warning">{athlete.pendingCount}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Athletes</h2>
            <p className="ui-card__caption">{athletes.data?.length ?? 0} registered</p>
          </div>

          {athletes.loading ? (
            <div className="ui-card__body"><Loader label="Loading athletes…" /></div>
          ) : athletes.error ? (
            <div className="ui-card__body">
              <StateMessage title="Could not load athletes" tone="error" onRetry={athletes.reload}>
                {athletes.error}
              </StateMessage>
            </div>
          ) : athletes.data?.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No athletes registered yet">
                Athletes appear here as soon as they sign up.
              </StateMessage>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>Sport</th>
                    <th>Age</th>
                    <th>Coach</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.data.map((athlete) => (
                    <tr key={athlete.athid}>
                      <td>{athlete.name}</td>
                      <td>{athlete.sporttype || '—'}</td>
                      <td>{athlete.age || '—'}</td>
                      <td>
                        {athlete?.coachid?.name ? (
                          <span className="ui-badge ui-badge--success">{athlete.coachid.name}</span>
                        ) : (
                          <span className="ui-badge ui-badge--warning">Not assigned</span>
                        )}
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

export default AdminDashboard;
