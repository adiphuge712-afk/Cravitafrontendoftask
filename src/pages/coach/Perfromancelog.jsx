import { useMemo, useState } from 'react';
import { FaBolt, FaCheckCircle, FaClipboardList, FaHourglassHalf } from 'react-icons/fa';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import PerformanceTrendChart from '@/components/common/PerformanceTrendChart';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import useLiveEvents from '@/hooks/useLiveEvents';
import { isCompleted, parseLogDate } from '@/utils/performance';
import './Performancelog.css';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Ratings the backend stores as free text, mapped onto the shared badge tones. */
const PERFORMANCE_TONE = {
  excellent: 'success',
  high: 'success',
  good: 'success',
  average: 'warning',
  low: 'danger',
};

const FATIGUE_TONE = {
  fresh: 'success',
  good: 'success',
  average: 'warning',
  tired: 'warning',
  high: 'danger',
  extreme: 'danger',
};

const toneClass = (map, value) => `ui-badge ui-badge--${map[String(value ?? '').toLowerCase()] || 'neutral'}`;

/** LocalDate arrives as "2026-09-21" or as [2026, 9, 21]; render both the same way. */
const formatDate = (value) => {
  const parsed = parseLogDate(value);
  if (!parsed) return Array.isArray(value) ? value.join('-') : value || '—';
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const Perfromancelog = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  const logs = useAsync(() => coachApi.getPerformanceLogs(coachId), [coachId], {
    enabled,
    initialData: [],
  });
  const myAthletes = useAsync(() => coachApi.getMyAthletes(coachId), [coachId], { enabled, initialData: [] });
  // Every drill this coach has ever set, so an assignment nobody has logged
  // yet is still counted as pending below instead of not existing at all -
  // same fix as CoachDashboard.jsx, and the same reason it lives here rather
  // than in the shared summarisePerformance/buildMonthlyTrend util: those are
  // also used by the admin dashboard.
  const workouts = useAsync(() => coachApi.getWorkouts(coachId), [coachId], { enabled, initialData: [] });

  // Live: ONE connection carrying both performance and schedule events,
  // instead of two - see CoachDashboard.jsx for the full reasoning. This
  // page is literally named after the data it shows, so a result recorded
  // from anywhere (this coach's own form, or an athlete marking their own
  // drill complete) reloads it, and a new drill reloads it too, since the
  // total-assignments stats and trend both depend on the drill count.
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

  const rows = useMemo(() => (Array.isArray(logs.data) ? logs.data : []), [logs.data]);

  // Filters narrow only the table below - the stat cards and trend chart
  // above still summarise every row, not just the ones currently shown.
  const [athleteFilter, setAthleteFilter] = useState('');
  const [workFilter, setWorkFilter] = useState('');

  // The trend chart gets its own athlete selector, separate from the table
  // filter above - it defaults to every athlete combined, but a coach can
  // switch it to one athlete to see just their line without losing the
  // table filter (which searches by typed name, not a fixed id) or the
  // stat cards (which stay whole-squad totals on purpose).
  const [chartAthleteId, setChartAthleteId] = useState('all');

  const filteredRows = useMemo(() => {
    const athleteQuery = athleteFilter.trim().toLowerCase();
    const workQuery = workFilter.trim().toLowerCase();
    if (!athleteQuery && !workQuery) return rows;

    return rows.filter((d) => {
      const athleteMatch = !athleteQuery || (d.athid?.name || '').toLowerCase().includes(athleteQuery);
      const workMatch = !workQuery || (d.workid?.workname || '').toLowerCase().includes(workQuery);
      return athleteMatch && workMatch;
    });
  }, [rows, athleteFilter, workFilter]);

  const stats = useMemo(() => {
    const totalAssignments = (myAthletes.data?.length || 0) * (workouts.data?.length || 0);
    const completed = rows.filter(isCompleted).length;
    return {
      total: totalAssignments,
      completed,
      pending: totalAssignments - completed,
      completionRate: totalAssignments ? Math.round((completed / totalAssignments) * 100) : 0,
    };
  }, [myAthletes.data, workouts.data, rows]);

  const trend = useMemo(() => {
    const allAthleteIds = (myAthletes.data || []).map((a) => a.athid);
    const athleteIds = chartAthleteId === 'all'
      ? allAthleteIds
      : allAthleteIds.filter((id) => String(id) === chartAthleteId);
    const completedPairs = new Set(
      rows.filter(isCompleted).map((log) => `${log?.athid?.athid}:${log?.workid?.workid}`),
    );

    const buckets = [];
    const now = new Date();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      buckets.push({ month: MONTH_LABELS[d.getMonth()], completed: 0, logged: 0, completionRate: 0 });
    }

    // Bucketed by the drill's own scheduled month for both lines, so
    // "completed" can never exceed "logged" even when a result is recorded
    // in a later month than the drill was scheduled for. A drill scheduled
    // outside the visible 6-month window (further in the future, or older)
    // is clamped into the nearest edge bucket rather than dropped - every
    // drill must land somewhere, so this chart's totals always match the
    // athletes x drills total in the stat cards above instead of silently
    // undercounting whenever a drill's startdate falls outside the window.
    for (const w of workouts.data || []) {
      const date = parseLogDate(w?.startdate);
      if (!date) continue;
      const drillMonthIndex = date.getFullYear() * 12 + date.getMonth();
      const bucketIndex = Math.min(5, Math.max(0, drillMonthIndex - currentMonthIndex + 5));
      const bucket = buckets[bucketIndex];

      for (const athId of athleteIds) {
        bucket.logged += 1;
        if (completedPairs.has(`${athId}:${w.workid}`)) bucket.completed += 1;
      }
    }

    for (const bucket of buckets) {
      bucket.completionRate = bucket.logged ? Math.round((bucket.completed / bucket.logged) * 100) : 0;
    }

    return buckets;
  }, [myAthletes.data, workouts.data, rows, chartAthleteId]);

  const selectedChartAthleteName = chartAthleteId === 'all'
    ? null
    : (myAthletes.data || []).find((a) => String(a.athid) === chartAthleteId)?.name;

  if (!ready) return <Loader overlay label="Checking your session…" />;

  const tableState = !enabled ? (
    <StateMessage title="Coach profile incomplete">
      Your sign-in token carries no coach id, so performance logs cannot be loaded. Signing out and
      back in usually fixes this.
    </StateMessage>
  ) : logs.loading ? (
    <Loader label="Loading performance logs…" />
  ) : logs.error ? (
    <StateMessage title="Could not load performance logs" tone="error" onRetry={logs.reload}>
      {logs.error}
    </StateMessage>
  ) : rows.length === 0 ? (
    <StateMessage title="No performance logged yet">
      Record a drill result from the Work Drill page and it will show up here with its fatigue and
      performance rating.
    </StateMessage>
  ) : filteredRows.length === 0 ? (
    <StateMessage title="No entries match this filter">
      Try a different athlete name or drill name, or clear the filter to see everything.
    </StateMessage>
  ) : null;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Athlete performance logs</h1>
            <p className="ui-page-subtitle">
              Every drill result you have recorded, counted straight from the database
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaClipboardList />}
            tone="primary"
            value={logs.loading || myAthletes.loading || workouts.loading ? '—' : stats.total}
            label="Total assignments"
            hint="Athletes × drills"
          />
          <StatCard
            icon={<FaCheckCircle />}
            tone="success"
            value={logs.loading ? '—' : stats.completed}
            label="Completed"
          />
          <StatCard
            icon={<FaHourglassHalf />}
            tone="warning"
            value={logs.loading || myAthletes.loading || workouts.loading ? '—' : stats.pending}
            label="Still pending"
          />
          <StatCard
            icon={<FaBolt />}
            tone={stats.completionRate >= 50 ? 'success' : 'danger'}
            value={logs.loading || myAthletes.loading || workouts.loading ? '—' : `${stats.completionRate}%`}
            label="Completion rate"
            hint={stats.total ? `across ${stats.total} assignments` : undefined}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <div>
              <h2 className="ui-card__title">Completion trend — last 6 months</h2>
              <p className="ui-card__caption">
                {selectedChartAthleteName
                  ? `${selectedChartAthleteName}'s drills only, whether logged yet or not`
                  : 'Every athlete/drill pair, whether logged yet or not'}
              </p>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="perf-trend-athlete-select">Show</label>
              <select
                id="perf-trend-athlete-select"
                className="ui-select"
                value={chartAthleteId}
                onChange={(e) => setChartAthleteId(e.target.value)}
              >
                <option value="all">All athletes</option>
                {(myAthletes.data || []).map((a) => (
                  <option key={a.athid} value={String(a.athid)}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ui-card__body">
            {logs.loading || myAthletes.loading || workouts.loading ? (
              <Loader label="Loading performance data…" />
            ) : logs.error || myAthletes.error || workouts.error ? (
              <StateMessage
                title="Could not load performance data"
                tone="error"
                onRetry={logs.error ? logs.reload : myAthletes.error ? myAthletes.reload : workouts.reload}
              >
                {logs.error || myAthletes.error || workouts.error}
              </StateMessage>
            ) : (
              <PerformanceTrendChart
                series={trend}
                loggedLabel="Total assignments"
                emptyHint="Once you assign drills to your squad, the trend will build up here."
              />
            )}
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Log history</h2>
            <p className="ui-card__caption">
              {logs.loading
                ? 'Loading…'
                : athleteFilter || workFilter
                  ? `${filteredRows.length} of ${rows.length} entries`
                  : `${rows.length} entries`}
            </p>
          </div>

          <div className="ui-card__body ui-filter-bar">
            <div className="ui-field">
              <label className="ui-label" htmlFor="perf-log-athlete-filter">Athlete name</label>
              <input
                id="perf-log-athlete-filter"
                className="ui-input"
                type="text"
                placeholder="Filter by athlete name"
                value={athleteFilter}
                onChange={(e) => setAthleteFilter(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="perf-log-work-filter">Drill name</label>
              <input
                id="perf-log-work-filter"
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

          {tableState ? (
            <div className="ui-card__body">{tableState}</div>
          ) : (
            <div className="ui-table-wrap perf-log-table">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Fatigue</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th>Coach</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Workout</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((d, index) => (
                    <tr key={d.logid}>
                      <td className="ui-muted">{index + 1}</td>
                      <td className="ui-nowrap">{formatDate(d.date)}</td>

                      <td>
                        <span className={toneClass(FATIGUE_TONE, d.fatiquelevel)}>
                          {d.fatiquelevel || 'N/A'}
                        </span>
                      </td>

                      <td>
                        <span className={toneClass(PERFORMANCE_TONE, d.performancematrix)}>
                          {d.performancematrix || 'N/A'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ui-badge ui-badge--${isCompleted(d) ? 'success' : 'neutral'}`}
                        >
                          {d.completestatus || 'N/A'}
                        </span>
                      </td>

                      <td>{d.athid?.coachid?.name || 'N/A'}</td>
                      <td>{d.athid?.name || 'N/A'}</td>
                      <td>{d.athid?.email || 'N/A'}</td>
                      <td>{d.workid?.workname || 'N/A'}</td>
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

export default Perfromancelog;
