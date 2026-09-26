import { useMemo, useState } from 'react';
import { FaCheckCircle, FaClipboardList, FaHourglassHalf, FaPercentage } from 'react-icons/fa';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import PerformanceTrendChart from '@/components/common/PerformanceTrendChart';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import { buildMonthlyTrend, isCompleted, parseLogDate, summarisePerformance } from '@/utils/performance';

/** `date` is a LocalDate, which arrives as "2026-09-21" or [2026, 9, 21]. */
function formatDate(value) {
  const parsed = parseLogDate(value);
  if (!parsed) return '—';

  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Fatigue and performance are free text; map loosely onto the badge tones. */
function levelTone(value) {
  const text = String(value || '').toLowerCase();
  if (/low|good|excellent|high perform/.test(text)) return 'success';
  if (/medium|moderate|average/.test(text)) return 'warning';
  if (/high|poor|bad|severe/.test(text)) return 'danger';
  return 'neutral';
}

/**
 * Academy-wide performance log.
 *
 * This page was a stub that rendered the word "PerformaceLog" behind a
 * hand-rolled token check. It now shows the rows the admin endpoint already
 * returns - every figure is counted from those rows, nothing is invented.
 */
const PerformaceLog = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const logs = useAsync(() => adminApi.getPerformanceLogs(), [], { enabled, initialData: [] });

  // One field per column the table actually shows, rather than a single box
  // guessing which column you meant. All combine with AND.
  const [athleteFilter, setAthleteFilter] = useState('');
  const [workFilter, setWorkFilter] = useState('');
  const [matrixFilter, setMatrixFilter] = useState('');
  const [fatigueFilter, setFatigueFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const anyFilterActive = Boolean(
    athleteFilter || workFilter || matrixFilter || fatigueFilter || statusFilter,
  );

  const stats = useMemo(() => summarisePerformance(logs.data), [logs.data]);
  const trend = useMemo(() => buildMonthlyTrend(logs.data), [logs.data]);

  const rows = useMemo(() => {
    const list = logs.data || [];
    if (!anyFilterActive) return list;

    const athleteQuery = athleteFilter.trim().toLowerCase();
    const workQuery = workFilter.trim().toLowerCase();
    const matrixQuery = matrixFilter.trim().toLowerCase();
    const fatigueQuery = fatigueFilter.trim().toLowerCase();
    const statusQuery = statusFilter.trim().toLowerCase();

    return list.filter((d) =>
      (!athleteQuery || (d?.athid?.name || '').toLowerCase().includes(athleteQuery)) &&
      (!workQuery || (d?.workid?.workname || '').toLowerCase().includes(workQuery)) &&
      (!matrixQuery || (d?.performancematrix || '').toLowerCase().includes(matrixQuery)) &&
      (!fatigueQuery || (d?.fatiquelevel || '').toLowerCase().includes(fatigueQuery)) &&
      (!statusQuery || (d?.completestatus || '').toLowerCase().includes(statusQuery)),
    );
  }, [logs.data, anyFilterActive, athleteFilter, workFilter, matrixFilter, fatigueFilter, statusFilter]);

  const clearFilters = () => {
    setAthleteFilter('');
    setWorkFilter('');
    setMatrixFilter('');
    setFatigueFilter('');
    setStatusFilter('');
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Performance log</h1>
            <p className="ui-page-subtitle">
              Every drill result coaches have recorded across the academy.
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaClipboardList />}
            tone="primary"
            value={logs.loading ? '—' : stats.total}
            label="Logged drills"
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
            value={logs.loading ? '—' : stats.pending}
            label="Still open"
          />
          <StatCard
            icon={<FaPercentage />}
            tone="success"
            value={logs.loading ? '—' : `${stats.completionRate}%`}
            label="Completion rate"
            hint={`${stats.completed} of ${stats.total} completed`}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Training completion — last 6 months</h2>
            <p className="ui-card__caption">Counted from the logs below</p>
          </div>
          <div className="ui-card__body">
            {logs.loading ? (
              <Loader label="Loading performance data…" />
            ) : logs.error ? (
              <StateMessage title="Could not load performance data" tone="error" onRetry={logs.reload}>
                {logs.error}
              </StateMessage>
            ) : (
              <PerformanceTrendChart
                series={trend}
                emptyHint="Once coaches record drill results, the monthly completion trend appears here."
              />
            )}
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Recorded results</h2>
            <p className="ui-card__caption">
              {logs.loading
                ? 'Loading…'
                : anyFilterActive
                  ? `${rows.length} of ${logs.data?.length ?? 0} shown`
                  : `${rows.length} shown`}
            </p>
          </div>

          <div className="ui-card__body ui-filter-bar">
            <div className="ui-field">
              <label className="ui-label" htmlFor="admin-perf-athlete">Athlete name</label>
              <input
                id="admin-perf-athlete"
                className="ui-input"
                type="text"
                placeholder="Filter by athlete name"
                value={athleteFilter}
                onChange={(e) => setAthleteFilter(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="admin-perf-work">Workout name</label>
              <input
                id="admin-perf-work"
                className="ui-input"
                type="text"
                placeholder="Filter by workout name"
                value={workFilter}
                onChange={(e) => setWorkFilter(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="admin-perf-matrix">Performance</label>
              <input
                id="admin-perf-matrix"
                className="ui-input"
                type="text"
                placeholder="e.g. High, Excellent"
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="admin-perf-fatigue">Fatigue</label>
              <input
                id="admin-perf-fatigue"
                className="ui-input"
                type="text"
                placeholder="e.g. Fresh, Extreme"
                value={fatigueFilter}
                onChange={(e) => setFatigueFilter(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="admin-perf-status">Status</label>
              <input
                id="admin-perf-status"
                className="ui-input"
                type="text"
                placeholder="e.g. Completed"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            {anyFilterActive && (
              <button type="button" className="ui-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          <div className="ui-card__body">
            {logs.loading ? (
              <Loader label="Loading performance logs…" />
            ) : logs.error ? (
              <StateMessage title="Could not load performance logs" tone="error" onRetry={logs.reload}>
                {logs.error}
              </StateMessage>
            ) : (logs.data?.length ?? 0) === 0 ? (
              <StateMessage title="No performance recorded yet">
                Results appear here as soon as a coach logs a drill against an athlete.
              </StateMessage>
            ) : rows.length === 0 ? (
              <StateMessage title="No results match this filter">
                Nothing matched. Clear the filters to see every log.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Athlete</th>
                      <th>Coach</th>
                      <th>Workout</th>
                      <th>Performance</th>
                      <th>Fatigue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d, index) => (
                      <tr key={d.logid}>
                        <td>{index + 1}</td>
                        <td className="ui-nowrap">{formatDate(d.date)}</td>
                        <td>{d.athid?.name || '—'}</td>
                        <td>{d.athid?.coachid?.name || '—'}</td>
                        <td>{d.workid?.workname || '—'}</td>
                        <td>
                          <span className={`ui-badge ui-badge--${levelTone(d.performancematrix)}`}>
                            {d.performancematrix || 'Not rated'}
                          </span>
                        </td>
                        <td>
                          <span className={`ui-badge ui-badge--${levelTone(d.fatiquelevel)}`}>
                            {d.fatiquelevel || 'Not rated'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`ui-badge ui-badge--${isCompleted(d) ? 'success' : 'warning'}`}
                          >
                            {d.completestatus || 'Pending'}
                          </span>
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
    </>
  );
};

export default PerformaceLog;
