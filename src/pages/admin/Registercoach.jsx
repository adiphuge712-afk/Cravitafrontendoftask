import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import './Registercoach.css';

const SPORTS = [
  'Cricket',
  'Kho-Kho',
  'Carrom',
  'Chess',
  'Mallakhamb',
  'Volleyball',
  'Football',
];

const EMPTY_FORM = {
  name: '',
  email: '',
  age: '',
  password: '',
  experience: '',
  specialization: '',
  adminid: '',
};

/**
 * Register a new coach under the signed-in admin.
 *
 * Same six fields and the same redirect to /Coachinfo as before. What changed:
 * the admin id now comes from useAuthUser instead of a local jwtDecode block,
 * and success/failure are banners rather than alert() - a failed submit leaves
 * the typed values on screen to correct instead of wiping the form.
 */
const Registercoach = () => {
  const navigate = useNavigate();
  const { user, ready } = useAuthUser();

  const [formdata, setData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(null);

  // Give the success banner a beat to be read, then continue to the coach
  // list exactly as the old alert()-then-navigate flow did.
  useEffect(() => {
    if (!registered) return undefined;

    const timer = setTimeout(() => navigate('/Coachinfo'), 1200);
    return () => clearTimeout(timer);
  }, [registered, navigate]);

  const setField = (field) => (e) => setData((prev) => ({ ...prev, [field]: e.target.value }));

  const formsubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi.registerCoach(user.adminid, formdata);
      setRegistered(formdata.name);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'That coach could not be registered. Check the details and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !user) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Register a coach</h1>
            <p className="ui-page-subtitle">
              The new coach is recorded against your admin account ({user.name || `#${user.adminid}`}).
            </p>
          </div>
        </header>

        <div className="register-shell">
          <section className="ui-card">
            <div className="ui-card__head">
              <h2 className="ui-card__title">Coach details</h2>
              <p className="ui-card__caption">All fields are required</p>
            </div>

            <div className="ui-card__body">
              {registered && (
                <div className="ui-alert ui-alert--success register-banner" role="status">
                  <span>
                    {registered} was registered. Taking you to the coach list…
                  </span>
                </div>
              )}

              {error && (
                <div className="ui-alert ui-alert--error register-banner" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <form className="ui-form" onSubmit={formsubmit}>
                <div className="ui-form-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-name">Coach name</label>
                    <input
                      id="rc-name"
                      type="text"
                      className="ui-input"
                      value={formdata.name}
                      onChange={setField('name')}
                      placeholder="Enter Coach Name"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-email">Email</label>
                    <input
                      id="rc-email"
                      type="email"
                      className="ui-input"
                      value={formdata.email}
                      onChange={setField('email')}
                      placeholder="Enter Email"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-password">Password</label>
                    <input
                      id="rc-password"
                      type="password"
                      className="ui-input"
                      value={formdata.password}
                      onChange={setField('password')}
                      placeholder="Enter Password"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-experience">Experience</label>
                    <input
                      id="rc-experience"
                      type="text"
                      className="ui-input"
                      value={formdata.experience}
                      onChange={setField('experience')}
                      placeholder="Years of Experience"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-specialization">Specialization</label>
                    <select
                      id="rc-specialization"
                      className="ui-select"
                      value={formdata.specialization}
                      onChange={setField('specialization')}
                      required
                    >
                      <option value="">Select Sport</option>
                      {SPORTS.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="rc-age">Age</label>
                    <input
                      id="rc-age"
                      type="number"
                      className="ui-input"
                      value={formdata.age}
                      onChange={setField('age')}
                      placeholder="Enter Age"
                      min="18"
                      required
                    />
                  </div>
                </div>

                <div className="ui-form-actions">
                  <button
                    type="submit"
                    className="ui-btn ui-btn--primary"
                    disabled={submitting || Boolean(registered)}
                  >
                    {submitting ? 'Processing…' : 'Register'}
                  </button>
                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => navigate('/Coachinfo')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Registercoach;
