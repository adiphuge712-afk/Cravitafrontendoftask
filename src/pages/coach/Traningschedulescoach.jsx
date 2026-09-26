import { useMemo, useState } from 'react';
import { FaCalendarCheck, FaClipboardList, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StatCard from '@/components/common/StatCard';
import StateMessage from '@/components/common/StateMessage';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import { parseLogDate } from '@/utils/performance';
import './Traningschedulescoach.css';

/** LocalDate can arrive as "2026-09-21" or [2026, 9, 21]; <input type="date"> needs the former. */
const toDateInput = (value) => {
  if (typeof value === 'string') return value.slice(0, 10);
  const parsed = parseLogDate(value);
  if (!parsed) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
};

const formatDate = (value) => {
  const parsed = parseLogDate(value);
  if (!parsed) return Array.isArray(value) ? value.join('-') : value || '—';
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const errorText = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const EMPTY_WORK = { workname: '', intencity: '', duration: '' };

/**
 * The coach's training plans: list, edit, delete, and attach work drills.
 *
 * Every outcome is reported inline (ui-alert / StateMessage) instead of with
 * alert(), and all calls go through coachApi rather than hand-built URLs.
 */
const Traningschedulescoach = () => {
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;
  const enabled = Boolean(coachId);

  const plans = useAsync(() => coachApi.getTrainingPlans(coachId), [coachId], {
    enabled,
    initialData: [],
  });

  const [edit, sededit] = useState(null);        // plan being edited
  const [workdata, setWorkdata] = useState(null); // drill being added
  const [confirmDelete, setConfirmDelete] = useState(null); // plan pending deletion
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);    // { tone, text }
  const [modalError, setModalError] = useState('');

  const rows = useMemo(() => (Array.isArray(plans.data) ? plans.data : []), [plans.data]);

  const activeCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return rows.filter((p) => {
      const end = parseLogDate(p.enddate);
      const start = parseLogDate(p.startdate);
      return (!start || start <= today) && (!end || end >= today);
    }).length;
  }, [rows]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return rows.filter((p) => {
      const start = parseLogDate(p.startdate);
      return start && start > today;
    }).length;
  }, [rows]);

  const closeModals = () => {
    sededit(null);
    setWorkdata(null);
    setConfirmDelete(null);
    setModalError('');
  };

  const profileedit = (d) => {
    setWorkdata(null);
    setModalError('');
    sededit({ ...d, startdate: toDateInput(d.startdate), enddate: toDateInput(d.enddate) });
  };

  const Workdriladd = (id) => {
    sededit(null);
    setModalError('');
    setWorkdata({ planid: id, ...EMPTY_WORK });
  };

  const formedit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setModalError('');
    try {
      await coachApi.updateTrainingPlan(edit.planid, edit);
      sededit(null);
      setNotice({ tone: 'success', text: `Plan “${edit.planname}” was updated.` });
      plans.reload();
    } catch (error) {
      setModalError(errorText(error, 'The plan could not be updated. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const workdrilladd = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setModalError('');
    try {
      await coachApi.addWorkout(workdata.planid, workdata);
      setNotice({ tone: 'success', text: `Work drill “${workdata.workname}” was added to the plan.` });
      setWorkdata(null);
    } catch (error) {
      setModalError(errorText(error, 'The work drill could not be added. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const deletestudent = async () => {
    if (busy || !confirmDelete) return;
    setBusy(true);
    setModalError('');
    try {
      await coachApi.deleteTrainingPlan(confirmDelete.planid);
      setNotice({ tone: 'success', text: `Plan “${confirmDelete.planname}” was deleted.` });
      setConfirmDelete(null);
      plans.reload();
    } catch (error) {
      setModalError(errorText(error, 'The plan could not be deleted. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  const tableState = !enabled ? (
    <StateMessage title="Coach profile incomplete">
      Your sign-in token carries no coach id, so your plans cannot be loaded. Signing out and back
      in usually fixes this.
    </StateMessage>
  ) : plans.loading ? (
    <Loader label="Loading training plans…" />
  ) : plans.error ? (
    <StateMessage title="Could not load your training plans" tone="error" onRetry={plans.reload}>
      {plans.error}
    </StateMessage>
  ) : rows.length === 0 ? (
    <StateMessage title="No training plans yet">
      Create your first plan from the Schedule page, then attach work drills to it here.
    </StateMessage>
  ) : null;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Training plans</h1>
            <p className="ui-page-subtitle">Plans you own, and the drills that hang off them</p>
          </div>
          <Link className="ui-btn ui-btn--primary plan-page__new" to="/Schedulecoach">
            <FaPlus aria-hidden="true" /> New plan
          </Link>
        </header>

        {notice && (
          <div className={`ui-alert ui-alert--${notice.tone} plan-page__notice`} role="status">
            {notice.text}
          </div>
        )}

        <section className="ui-stat-grid">
          <StatCard
            icon={<FaClipboardList />}
            tone="primary"
            value={plans.loading ? '—' : rows.length}
            label="Total plans"
          />
          <StatCard
            icon={<FaCalendarCheck />}
            tone="success"
            value={plans.loading ? '—' : activeCount}
            label="Running today"
          />
          <StatCard
            icon={<FaCalendarCheck />}
            tone="warning"
            value={plans.loading ? '—' : upcomingCount}
            label="Starting later"
          />
        </section>

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Your plans</h2>
            <p className="ui-card__caption">{plans.loading ? 'Loading…' : `${rows.length} plans`}</p>
          </div>

          {tableState ? (
            <div className="ui-card__body">{tableState}</div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Plan name</th>
                    <th>Type</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Actions</th>
                    <th>Workout</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((d, index) => (
                    <tr key={d.planid}>
                      <td className="ui-muted">{index + 1}</td>
                      <td>{d.planname}</td>
                      <td>
                        <span className="ui-badge ui-badge--neutral">{d.plantype || '—'}</span>
                      </td>
                      <td className="ui-nowrap">{formatDate(d.startdate)}</td>
                      <td className="ui-nowrap">{formatDate(d.enddate)}</td>

                      <td>
                        <div className="ui-row-actions">
                          <button
                            type="button"
                            className="ui-btn ui-btn--sm"
                            onClick={() => profileedit(d)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ui-btn ui-btn--sm ui-btn--danger"
                            onClick={() => {
                              closeModals();
                              setConfirmDelete(d);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="ui-btn ui-btn--sm ui-btn--primary ui-nowrap"
                          onClick={() => Workdriladd(d.planid)}
                        >
                          Add workdrill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Edit plan */}
      {edit && (
        <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit training plan">
          <div className="ui-modal">
            <form onSubmit={formedit}>
              <div className="ui-modal__head">
                <h3 className="ui-modal__title">Edit training plan</h3>
              </div>

              <div className="ui-modal__body ui-form">
                {modalError && <div className="ui-alert ui-alert--error">{modalError}</div>}

                <div className="ui-form-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="edit-planname">Plan name</label>
                    <input
                      id="edit-planname"
                      className="ui-input"
                      type="text"
                      value={edit.planname || ''}
                      onChange={(e) => sededit({ ...edit, planname: e.target.value })}
                      placeholder="Plan Name"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="edit-plantype">Plan type</label>
                    <input
                      id="edit-plantype"
                      className="ui-input"
                      type="text"
                      value={edit.plantype || ''}
                      onChange={(e) => sededit({ ...edit, plantype: e.target.value })}
                      placeholder="Plan Type"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="edit-startdate">Start date</label>
                    <input
                      id="edit-startdate"
                      className="ui-input"
                      type="date"
                      value={edit.startdate || ''}
                      onChange={(e) => sededit({ ...edit, startdate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="edit-enddate">End date</label>
                    <input
                      id="edit-enddate"
                      className="ui-input"
                      type="date"
                      value={edit.enddate || ''}
                      onChange={(e) => sededit({ ...edit, enddate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="ui-modal__foot">
                <button type="button" className="ui-btn" onClick={closeModals} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
                  {busy ? 'Updating…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add work drill */}
      {workdata && (
        <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label="Add work drill">
          <div className="ui-modal">
            <form onSubmit={workdrilladd}>
              <div className="ui-modal__head">
                <h3 className="ui-modal__title">Add workdrill</h3>
              </div>

              <div className="ui-modal__body ui-form">
                {modalError && <div className="ui-alert ui-alert--error">{modalError}</div>}

                <div className="ui-field">
                  <label className="ui-label" htmlFor="work-name">Work name</label>
                  <input
                    id="work-name"
                    className="ui-input"
                    type="text"
                    value={workdata.workname}
                    onChange={(e) => setWorkdata({ ...workdata, workname: e.target.value })}
                    placeholder="Work Name"
                    required
                  />
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="work-duration">Duration</label>
                  <input
                    id="work-duration"
                    className="ui-input"
                    type="text"
                    value={workdata.duration}
                    onChange={(e) => setWorkdata({ ...workdata, duration: e.target.value })}
                    placeholder="Duration"
                    required
                  />
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="work-intensity">Intensity</label>
                  <select
                    id="work-intensity"
                    className="ui-select"
                    value={workdata.intencity}
                    onChange={(e) => setWorkdata({ ...workdata, intencity: e.target.value })}
                    required
                  >
                    <option value="">Select Intensity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="ui-modal__foot">
                <button type="button" className="ui-btn" onClick={closeModals} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
                  {busy ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="ui-modal">
            <div className="ui-modal__head">
              <h3 className="ui-modal__title">Delete this plan?</h3>
            </div>

            <div className="ui-modal__body">
              {modalError && <div className="ui-alert ui-alert--error">{modalError}</div>}
              <p>
                “{confirmDelete.planname}” and its schedule will be removed. This cannot be undone.
              </p>
            </div>

            <div className="ui-modal__foot">
              <button type="button" className="ui-btn" onClick={closeModals} disabled={busy}>
                Keep plan
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--danger"
                onClick={deletestudent}
                disabled={busy}
              >
                {busy ? 'Deleting…' : 'Delete plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Traningschedulescoach;
