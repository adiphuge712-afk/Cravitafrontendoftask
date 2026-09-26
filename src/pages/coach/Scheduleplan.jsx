import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavbarCoach from '@/components/layout/NavbarCoach';
import Loader from '@/components/common/Loader';
import StateMessage from '@/components/common/StateMessage';
import coachApi from '@/api/coachApi';
import useAuthUser from '@/hooks/useAuthUser';
import './Scheduleplan.css';

const EMPTY_PLAN = {
  planname: '',
  plantype: '',
  startdate: '',
  enddate: '',
};

/** Create a training plan for the signed-in coach. */
const Scheduleplan = () => {
  const navigate = useNavigate();
  const { user, ready } = useAuthUser();
  const coachId = user?.coachid;

  const [reg, setRegister] = useState(EMPTY_PLAN);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { tone: 'success' | 'error', text }
  const [dateError, setDateError] = useState('');

  // The page used to alert() then navigate immediately; now it shows the
  // confirmation inline and moves on once the coach has had a chance to see it.
  const redirectTimer = useRef(null);
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const field = (key) => (e) => {
    setRegister((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === 'startdate' || key === 'enddate') setDateError('');
  };

  const formsubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (reg.startdate && reg.enddate && reg.enddate < reg.startdate) {
      setDateError('The end date cannot be before the start date.');
      return;
    }

    setNotice(null);
    setSubmitting(true);

    try {
      await coachApi.addTrainingPlan(coachId, reg);
      setRegister(EMPTY_PLAN);
      setNotice({ tone: 'success', text: 'Training plan created. Taking you to your plans…' });
      redirectTimer.current = setTimeout(() => navigate('/Traningplans'), 1200);
    } catch (error) {
      setNotice({
        tone: 'error',
        text:
          error?.response?.data?.message ||
          error?.message ||
          'The plan could not be saved. Please check the details and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <NavbarCoach />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Schedule a training plan</h1>
            <p className="ui-page-subtitle">
              New plans are attached to your coach profile and can be given work drills afterwards
            </p>
          </div>
        </header>

        <section className="ui-card schedule-plan__card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Plan details</h2>
            <p className="ui-card__caption">All fields are required</p>
          </div>

          <div className="ui-card__body">
            {!coachId ? (
              <StateMessage title="Coach profile incomplete">
                Your sign-in token carries no coach id, so a plan cannot be attached to you. Signing
                out and back in usually fixes this.
              </StateMessage>
            ) : (
              <form className="ui-form" onSubmit={formsubmit}>
                {notice && (
                  <div className={`ui-alert ui-alert--${notice.tone}`} role="status">
                    {notice.text}
                  </div>
                )}

                <div className="ui-form-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="planname">Plan name</label>
                    <input
                      id="planname"
                      className="ui-input"
                      type="text"
                      placeholder="Enter Plan Name"
                      value={reg.planname}
                      onChange={field('planname')}
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="plantype">Plan type</label>
                    <input
                      id="plantype"
                      className="ui-input"
                      type="text"
                      placeholder="Enter Plan Type"
                      value={reg.plantype}
                      onChange={field('plantype')}
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="startdate">Start date</label>
                    <input
                      id="startdate"
                      className="ui-input"
                      type="date"
                      value={reg.startdate}
                      onChange={field('startdate')}
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="enddate">End date</label>
                    <input
                      id="enddate"
                      className="ui-input"
                      type="date"
                      value={reg.enddate}
                      onChange={field('enddate')}
                      required
                    />
                    {dateError && <span className="ui-field__error">{dateError}</span>}
                  </div>
                </div>

                <div className="ui-form-actions">
                  <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
                    {submitting ? 'Creating…' : 'Create plan'}
                  </button>
                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => navigate('/Traningplans')}
                    disabled={submitting}
                  >
                    View existing plans
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Scheduleplan;
