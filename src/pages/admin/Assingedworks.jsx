import { useMemo, useState } from 'react';
import { FaCalendarAlt, FaDumbbell, FaUserTie } from 'react-icons/fa';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import { parseLogDate } from '@/utils/performance';

/** Dates arrive as LocalDate - "2026-09-21" or [2026, 9, 21]. */
function formatDate(value) {
  const parsed = parseLogDate(value);
  if (!parsed) return '—';

  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function intensityTone(value) {
  const text = String(value || '').toLowerCase();
  if (/low|light|easy/.test(text)) return 'success';
  if (/medium|moderate/.test(text)) return 'warning';
  if (/high|hard|intense/.test(text)) return 'danger';
  return 'neutral';
}

/**
 * Work drills the coaches have assigned, grouped under their training plan.
 *
 * This page previously rendered the literal word "Assingedworks" behind a
 * token block that referenced `jwtDecode` and `setuserdata` without either
 * being defined - it threw as soon as it rendered. It now reads the plans and
 * drills the admin endpoints already expose.
 */
const Assingedworks = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const plans = useAsync(() => adminApi.getTrainingPlans(), [], { enabled, initialData: [] });
  const workouts = useAsync(() => adminApi.getWorkouts(), [], { enabled, initialData: [] });

  const [search, setSearch] = useState('');

  // One row per drill, carrying the plan and coach it belongs to so the table
  // reads without the user having to cross-reference two lists.
  const rows = useMemo(() => {
    const planById = new Map((plans.data || []).map((p) => [p.planid, p]));

    return (workouts.data || []).map((w) => {
      const plan = w?.plan ? planById.get(w.plan.planid) || w.plan : null;

      return {
        workid: w.workid,
        workname: w.workname,
        duration: w.duration,
        intencity: w.intencity,
        startdate: w.startdate,
        planname: plan?.planname || '—',
        plantype: plan?.plantype || '',
        coachname: plan?.coachid?.name || '—',
      };
    });
  }, [workouts.data, plans.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) =>
      [r.workname, r.planname, r.plantype, r.coachname, r.intencity]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [rows, search]);

  const coachCount = useMemo(
    () => new Set((plans.data || []).map((p) => p?.coachid?.coachid).filter(Boolean)).size,
    [plans.data],
  );

  const loading = plans.loading || workouts.loading;
  const error = workouts.error || plans.error;
  const reload = () => {
    workouts.reload();
    plans.reload();
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Assigned works</h1>
            <p className="ui-page-subtitle">
              Every work drill coaches have scheduled, with the training plan it belongs to.
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaDumbbell />}
            tone="primary"
            value={loading ? '—' : rows.length}
            label="Work drills"
          />
          <StatCard
            icon={<FaCalendarAlt />}
            tone="success"
            value={loading ? '—' : (plans.data?.length ?? 0)}
            label="Training plans"
          />
          <StatCard
            icon={<FaUserTie />}
            tone="warning"
            value={loading ? '—' : coachCount}
            label="Coaches with a plan"
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Scheduled drills</h2>
            <p className="ui-card__caption">{loading ? 'Loading…' : `${filtered.length} shown`}</p>
          </div>

          <div className="ui-card__body">
            <div className="ui-toolbar">
              <input
                type="search"
                className="ui-input ui-search"
                placeholder="Search drill, plan or coach"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search assigned works"
              />
            </div>

            {loading ? (
              <Loader label="Loading assigned works…" />
            ) : error ? (
              <StateMessage title="Could not load assigned works" tone="error" onRetry={reload}>
                {error}
              </StateMessage>
            ) : rows.length === 0 ? (
              <StateMessage title="No work drills scheduled yet">
                Drills appear here once a coach adds them to one of their training plans.
              </StateMessage>
            ) : filtered.length === 0 ? (
              <StateMessage title="No drills match that search">
                Nothing matched “{search}”. Clear the search box to see everything.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Work drill</th>
                      <th>Training plan</th>
                      <th>Coach</th>
                      <th>Start date</th>
                      <th>Duration</th>
                      <th>Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, index) => (
                      <tr key={r.workid}>
                        <td>{index + 1}</td>
                        <td>{r.workname || '—'}</td>
                        <td>
                          {r.planname}
                          {r.plantype && <span className="ui-muted"> · {r.plantype}</span>}
                        </td>
                        <td>{r.coachname}</td>
                        <td className="ui-nowrap">{formatDate(r.startdate)}</td>
                        <td className="ui-nowrap">{r.duration ? `${r.duration} min` : '—'}</td>
                        <td>
                          <span className={`ui-badge ui-badge--${intensityTone(r.intencity)}`}>
                            {r.intencity || 'Not set'}
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

export default Assingedworks;
