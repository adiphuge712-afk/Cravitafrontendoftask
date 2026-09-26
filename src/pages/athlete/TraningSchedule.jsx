import NavbarOfAth from '@/components/layout/NavbarAthlete';
import Loader from '@/components/common/Loader';
import StateMessage from '@/components/common/StateMessage';
import athleteApi from '@/api/athleteApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import useLiveEvents from '@/hooks/useLiveEvents';
import './TraningSchedule.css';

/**
 * The athlete's full training schedule.
 *
 * The "ask the admin for a coach" flow (useCoachRequest/CoachRequestModal)
 * lives only on AtheletDashboard now - the athlete's landing page - so it
 * isn't shown twice. This page just points there while no coach is assigned.
 */
const TraningSchedule = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid?.coachid;
  const hasCoach = Boolean(user?.coachid);

  const workouts = useAsync(
    () => athleteApi.getWorkoutsByCoach(coachId),
    [coachId],
    { enabled: Boolean(coachId), initialData: [] },
  );

  // Live: a new drill from the coach shows up here without a page refresh.
  useLiveEvents('/athelet/sse/schedule', () => workouts.reload(), Boolean(coachId));

  if (!ready) return <Loader overlay label="Loading schedule…" />;

  const rows = Array.isArray(workouts.data) ? workouts.data : [];

  return (
    <>
      <NavbarOfAth />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Training schedule</h1>
            <p className="ui-page-subtitle">
              {hasCoach
                ? `Every drill your coach${user?.coachid?.name ? `, ${user.coachid.name},` : ''} has planned for you`
                : 'Your schedule appears once an admin assigns you a coach'}
            </p>
          </div>
        </header>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Planned drills</h2>
            <p className="ui-card__caption">
              {rows.length} {rows.length === 1 ? 'drill' : 'drills'}
            </p>
          </div>

          {!hasCoach ? (
            <div className="ui-card__body">
              <StateMessage title="No coach assigned yet">
                Request a coach from your dashboard — your training plan shows up here as soon as
                one is assigned to you.
              </StateMessage>
            </div>
          ) : workouts.loading ? (
            <div className="ui-card__body">
              <Loader label="Loading your drills…" />
            </div>
          ) : workouts.error ? (
            <div className="ui-card__body">
              <StateMessage title="Could not load your schedule" tone="error" onRetry={workouts.reload}>
                {workouts.error}
              </StateMessage>
            </div>
          ) : rows.length === 0 ? (
            <div className="ui-card__body">
              <StateMessage title="Nothing scheduled yet">
                Your coach has not published any drills for you. Check back after your next session.
              </StateMessage>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table schedule-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Coach</th>
                    <th>Experience</th>
                    <th>Plan</th>
                    <th>Workout</th>
                    <th>Duration</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d, index) => (
                    <tr key={d.workid}>
                      <td>{index + 1}</td>
                      <td>{d.plan?.coachid?.name || '—'}</td>
                      <td className="ui-nowrap">
                        {d.plan?.coachid?.experience != null ? `${d.plan.coachid.experience} yrs` : '—'}
                      </td>
                      <td>{d.plan?.planname || '—'}</td>
                      <td>{d.workname}</td>
                      <td className="ui-nowrap">{d.duration} min</td>
                      <td className="ui-nowrap">{d.plan?.startdate || '—'}</td>
                      <td className="ui-nowrap">{d.plan?.enddate || '—'}</td>
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

export default TraningSchedule;
