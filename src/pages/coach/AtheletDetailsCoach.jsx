import { useMemo, useState } from 'react';
import { FaEnvelope, FaFutbol, FaUsers } from 'react-icons/fa';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import './AtheletDetailsCoach.css';

/**
 * Read-only roster of the athletes assigned to the signed-in coach.
 *
 * Identity comes from useAuthUser and the rows from coachApi, so this file no
 * longer repeats the decode-token/redirect block or builds its own URL.
 */
const AtheletDetailsCoach = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  const athletes = useAsync(() => coachApi.getMyAthletes(coachId), [coachId], {
    enabled,
    initialData: [],
  });

  const [search, setSearch] = useState('');

  const rows = useMemo(() => Array.isArray(athletes.data) ? athletes.data : [], [athletes.data]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((a) =>
      [a.name, a.email, a.sporttype, a.athid]
        .map((v) => String(v ?? '').toLowerCase())
        .some((v) => v.includes(term)),
    );
  }, [rows, search]);

  const sports = useMemo(
    () => new Set(rows.map((a) => a.sporttype).filter(Boolean)).size,
    [rows],
  );

  const withEmail = useMemo(() => rows.filter((a) => a.email).length, [rows]);

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Athlete details</h1>
            <p className="ui-page-subtitle">
              Everyone currently assigned to {user?.name ? `coach ${user.name}` : 'you'}
            </p>
          </div>
        </header>

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaUsers />}
            tone="primary"
            value={athletes.loading ? '—' : rows.length}
            label="Assigned athletes"
          />
          <StatCard
            icon={<FaFutbol />}
            tone="warning"
            value={athletes.loading ? '—' : sports}
            label="Sports covered"
          />
          <StatCard
            icon={<FaEnvelope />}
            tone="success"
            value={athletes.loading ? '—' : withEmail}
            label="Contactable by email"
            hint={rows.length ? `${rows.length - withEmail} missing an address` : undefined}
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Roster</h2>
            <p className="ui-card__caption">
              {athletes.loading ? 'Loading…' : `${visible.length} of ${rows.length} shown`}
            </p>
          </div>

          <div className="ui-card__body athlete-roster__toolbar">
            <div className="ui-toolbar">
              <input
                type="search"
                className="ui-input ui-search"
                placeholder="Search by name, email, sport or id"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search athletes"
              />
            </div>
          </div>

          {!enabled ? (
            <div className="ui-card__body">
              <StateMessage title="Coach profile incomplete">
                Your sign-in token carries no coach id, so your roster cannot be loaded. Signing out
                and back in usually fixes this.
              </StateMessage>
            </div>
          ) : athletes.loading ? (
            <div className="ui-card__body">
              <Loader label="Loading athletes…" />
            </div>
          ) : athletes.error ? (
            <div className="ui-card__body">
              <StateMessage title="Could not load your athletes" tone="error" onRetry={athletes.reload}>
                {athletes.error}
              </StateMessage>
            </div>
          ) : rows.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No athletes assigned yet">
                An admin assigns athletes to a coach; as soon as that happens they appear here.
              </StateMessage>
            </div>
          ) : visible.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="No athletes match that search">
                Nothing in your roster matches “{search}”. Clear the search box to see all{' '}
                {rows.length} athletes.
              </StateMessage>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Email</th>
                    <th>Sport</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((d, index) => (
                    <tr key={d.athid}>
                      <td className="ui-muted">{index + 1}</td>
                      <td className="ui-nowrap">{d.athid}</td>
                      <td>{d.name}</td>
                      <td>{d.age || '—'}</td>
                      <td>{d.email || '—'}</td>
                      <td>
                        <span className="ui-badge ui-badge--neutral">{d.sporttype || 'Unassigned'}</span>
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

export default AtheletDetailsCoach;
