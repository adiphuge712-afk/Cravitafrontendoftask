import { useMemo } from 'react';
import { FaChartLine, FaCheckCircle, FaClipboardList, FaUsers } from 'react-icons/fa';

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
import './CoachDashbord.css';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CoachDashboard = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  // Scoped to this coach rather than the whole academy.
  const myAthletes = useAsync(() => coachApi.getMyAthletes(coachId), [coachId], { enabled, initialData: [] });
  const plans = useAsync(() => coachApi.getTrainingPlans(coachId), [coachId], { enabled, initialData: [] });
  const performance = useAsync(() => coachApi.getPerformanceLogs(coachId), [coachId], { enabled, initialData: [] });
  // Every drill this coach has ever set, so an assignment nobody has logged
  // yet is still counted as pending below instead of not existing at all.
  const workouts = useAsync(() => coachApi.getWorkouts(coachId), [coachId], { enabled, initialData: [] });

  // Live: ONE connection carrying both performance and schedule events,
  // instead of two separate long-lived streams. This dashboard, the Work
  // Management page and the Performance Log page had each grown their own
  // pair of connections, and multiple coach pages or tabs open at once could
  // eat most of a browser's 6-connection-per-origin budget, stalling
  // ordinary page loads - see /athelet/sse/events for the same fix and the
  // full reasoning.
  useLiveEvents(
    '/coach/sse/events',
    (event, eventName) => {
      if (eventName === 'performance-updated') {
        performance.reload();
      } else if (eventName === 'workout-added') {
        workouts.reload();
      }
    },
    enabled,
  );

  // "Total" here is every athlete/drill pair this squad could possibly log
  // (athletes x drills), not just the rows someone has already logged - a
  // drill nobody on the squad has touched yet used to be invisible, which is
  // exactly how "8 possible, 2 untouched" showed up as "6 logged, 100%
  // complete". completed still comes straight from the logged rows: the
  // backend already scopes them to this coach's squad, so no extra
  // membership filtering is needed for that half. Local to this page - see
  // AtheletDashboard.jsx for the same fix and why it isn't in the shared util.
  const stats = useMemo(() => {
    const totalAssignments = (myAthletes.data?.length || 0) * (workouts.data?.length || 0);
    const completed = (performance.data || []).filter(isCompleted).length;
    return {
      total: totalAssignments,
      completed,
      pending: totalAssignments - completed,
      completionRate: totalAssignments ? Math.round((completed / totalAssignments) * 100) : 0,
    };
  }, [myAthletes.data, workouts.data, performance.data]);

  const trend = useMemo(() => {
    const athleteIds = (myAthletes.data || []).map((a) => a.athid);
    // Which (athlete, drill) pairs are actually completed - keyed the same
    // way the loop below looks them up, so "completed" can never exceed
    // "logged" for a bucket even when a drill was logged in a different
    // month than it was scheduled for.
    const completedPairs = new Set(
      (performance.data || [])
        .filter(isCompleted)
        .map((log) => `${log?.athid?.athid}:${log?.workid?.workid}`),
    );

    const buckets = [];
    const now = new Date();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      buckets.push({ month: MONTH_LABELS[d.getMonth()], completed: 0, logged: 0, completionRate: 0 });
    }

    // Every drill contributes one assignment slot per athlete on the squad,
    // all bucketed by that drill's own scheduled month - not by whenever the
    // log happened to be recorded, so a bucket's completed count can never
    // exceed its logged (total) count. A drill scheduled outside the visible
    // 6-month window (further in the future, or older) is clamped into the
    // nearest edge bucket rather than dropped - every drill must land
    // somewhere, so this chart's totals always match the athletes x drills
    // total in the stat cards above.
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
  }, [myAthletes.data, workouts.data, performance.data]);

  // Per-athlete completed/pending counts for the roster table below - same
  // "total drills" denominator as the stat tiles above, just broken out by
  // athlete instead of summed across the whole squad.
  const athleteStats = useMemo(() => {
    const totalDrills = workouts.data?.length || 0;
    const map = new Map();
    for (const athlete of myAthletes.data || []) {
      const completed = (performance.data || []).filter(
        (log) => log?.athid?.athid === athlete.athid && isCompleted(log),
      ).length;
      map.set(athlete.athid, { completed, pending: totalDrills - completed });
    }
    return map;
  }, [myAthletes.data, workouts.data, performance.data]);

  if (!ready) return <Loader overlay label="Loading dashboard…" />;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Welcome back, {user?.name || 'Coach'}</h1>
            <p className="ui-page-subtitle">
              {user?.specialization ? `${user.specialization} · ` : ''}
              Your squad and training activity, read live from the database
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaUsers />}
            tone="primary"
            value={myAthletes.loading ? '—' : (myAthletes.data?.length ?? 0)}
            label="My athletes"
          />
          <StatCard
            icon={<FaClipboardList />}
            tone="warning"
            value={plans.loading ? '—' : (plans.data?.length ?? 0)}
            label="Training plans"
          />
          <StatCard
            icon={<FaChartLine />}
            tone="primary"
            value={performance.loading || workouts.loading ? '—' : stats.total}
            label="Total assignments"
            hint="Athletes × drills"
          />
          <StatCard
            icon={<FaCheckCircle />}
            tone="success"
            value={performance.loading || workouts.loading ? '—' : `${stats.completionRate}%`}
            label="Completion rate"
            hint={`${stats.pending} still pending`}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Squad completion — last 6 months</h2>
            <p className="ui-card__caption">Every athlete/drill pair, whether logged yet or not</p>
          </div>
          <div className="ui-card__body">
            {!enabled ? (
              <StateMessage title="Coach profile incomplete">
                Your sign-in token has no coach id, so squad data cannot be loaded. Signing out and back in usually fixes this.
              </StateMessage>
            ) : performance.loading || workouts.loading ? (
              <Loader label="Loading performance data…" />
            ) : performance.error || workouts.error ? (
              <StateMessage title="Could not load performance data" tone="error" onRetry={performance.error ? performance.reload : workouts.reload}>
                {performance.error || workouts.error}
              </StateMessage>
            ) : (
              <PerformanceTrendChart
                series={trend}
                emptyHint="Once you assign drills to your squad, the trend will build up here."
                loggedLabel="Total assignments"
              />
            )}
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">My athletes</h2>
            <p className="ui-card__caption">{myAthletes.data?.length ?? 0} assigned to you</p>
          </div>

          {myAthletes.loading ? (
            <div className="ui-card__body"><Loader label="Loading athletes…" /></div>
          ) : myAthletes.error ? (
            <div className="ui-card__body">
              <StateMessage title="Could not load your athletes" tone="error" onRetry={myAthletes.reload}>
                {myAthletes.error}
              </StateMessage>
            </div>
          ) : myAthletes.data?.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No athletes assigned yet">
                An admin assigns athletes to you; they will show up here once that happens.
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
                    <th>Email</th>
                    <th>Completed</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {myAthletes.data.map((athlete) => {
                    const counts = athleteStats.get(athlete.athid);
                    const countsLoading = performance.loading || workouts.loading;
                    return (
                      <tr key={athlete.athid}>
                        <td>{athlete.name}</td>
                        <td>{athlete.sporttype || '—'}</td>
                        <td>{athlete.age || '—'}</td>
                        <td>{athlete.email}</td>
                        <td>
                          <span className="ui-badge ui-badge--success">
                            {countsLoading ? '—' : (counts?.completed ?? 0)}
                          </span>
                        </td>
                        <td>
                          <span className="ui-badge ui-badge--warning">
                            {countsLoading ? '—' : (counts?.pending ?? 0)}
                          </span>
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
    </>
  );
};

export default CoachDashboard;
