import { useState } from 'react';

import NavbarOfAth from '@/components/layout/NavbarAthlete';
import Loader from '@/components/common/Loader';
import athleteApi from '@/api/athleteApi';
import useAuthUser from '@/hooks/useAuthUser';
import './ComplainCoach.css';

const EMPTY_FORM = { comment: '', difficultlevel: '' };

/**
 * Lets an athlete send written feedback about a session to their coach.
 *
 * Identity comes from useAuthUser, the POST goes through athleteApi, and the
 * outcome is rendered inline instead of through a blocking alert().
 */
const ComplainCoach = () => {
  const { user, ready } = useAuthUser();
  const athleteId = user?.athid;

  const [complain, setComplain] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null); // { tone, message }

  const update = (field) => (e) => {
    setComplain((prev) => ({ ...prev, [field]: e.target.value }));
    setFeedbackState(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!athleteId) return;

    setSubmitting(true);
    setFeedbackState(null);
    try {
      await athleteApi.submitComplaint(athleteId, complain);
      setComplain(EMPTY_FORM);
      setFeedbackState({ tone: 'success', message: 'Thanks — your feedback was sent to your coach.' });
    } catch (err) {
      setFeedbackState({
        tone: 'error',
        message:
          err?.response?.data?.message ||
          'We could not send your feedback right now. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <Loader overlay label="Loading feedback form…" />;

  return (
    <>
      <NavbarOfAth />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Coach feedback</h1>
            <p className="ui-page-subtitle">
              Tell your coach how the sessions are going so the plan can be adjusted.
            </p>
          </div>
        </header>

        <section className="ui-card feedback-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Send feedback</h2>
            <p className="ui-card__caption">
              {user?.coachid?.name ? `Goes to ${user.coachid.name}` : 'Goes to your assigned coach'}
            </p>
          </div>

          <div className="ui-card__body">
            {feedbackState && (
              <div
                className={`ui-alert ui-alert--${feedbackState.tone} feedback-alert`}
                role={feedbackState.tone === 'error' ? 'alert' : 'status'}
              >
                {feedbackState.message}
              </div>
            )}

            <form className="ui-form" onSubmit={handleSubmit}>
              <div className="ui-field">
                <label className="ui-label" htmlFor="comment">
                  Your comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  className="ui-textarea"
                  placeholder="Enter your comment..."
                  rows={4}
                  value={complain.comment}
                  onChange={update('comment')}
                  required
                />
              </div>

              <div className="ui-field">
                <label className="ui-label" htmlFor="difficultlevel">
                  Difficulty level
                </label>
                <select
                  id="difficultlevel"
                  name="difficultlevel"
                  className="ui-select"
                  value={complain.difficultlevel}
                  onChange={update('difficultlevel')}
                  required
                >
                  <option value="">Select difficulty level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="ui-form-actions">
                <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit feedback'}
                </button>
                <span className="ui-muted feedback-hint">
                  Your coach sees this alongside your performance log.
                </span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ComplainCoach;
