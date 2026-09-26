import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import authApi from '@/api/authApi';
import './Register.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  age: '',
  sporttype: '',
};

const SPORTS = ['Cricket', 'Kho-Kho', 'Carrom', 'Chess', 'Mallakhamb', 'Volleyball', 'Football'];

/**
 * Public athlete sign-up.
 *
 * Like Login this must not use useAuthUser - a visitor here has no token yet,
 * and redirecting them to /login would defeat the page.
 */
const Register = () => {
  const navigate = useNavigate();
  const [reg, setRegister] = useState(EMPTY_FORM);
  const [isLoding, setLoding] = useState(false);
  const [errormsg, seterrormsg] = useState('');

  const update = (field) => (e) => {
    setRegister((prev) => ({ ...prev, [field]: e.target.value }));
    seterrormsg('');
  };

  const formsubmit = async (e) => {
    e.preventDefault();
    setLoding(true);
    seterrormsg('');

    try {
      await authApi.registerAthlete(reg);
      setRegister(EMPTY_FORM);
      navigate('/login');
    } catch (error) {
      seterrormsg(
        error?.response?.data?.message ||
          'We could not create your account. Please check your details and try again.',
      );
    } finally {
      setLoding(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-head">
          <h1 className="register-title">Create account</h1>
          <p className="register-subtitle">Join Cravita and start tracking your training</p>
        </div>

        {errormsg && (
          <div className="ui-alert ui-alert--error register-alert" role="alert">
            {errormsg}
          </div>
        )}

        <form className="ui-form" onSubmit={formsubmit}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="reg-name">
              Full name
            </label>
            <input
              id="reg-name"
              className="ui-input"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={reg.name}
              onChange={update('name')}
              required
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              className="ui-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={reg.email}
              onChange={update('email')}
              required
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              className="ui-input"
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
              value={reg.password}
              onChange={update('password')}
              required
            />
          </div>

          <div className="ui-form-grid">
            <div className="ui-field">
              <label className="ui-label" htmlFor="reg-age">
                Age
              </label>
              <input
                id="reg-age"
                className="ui-input"
                type="number"
                placeholder="Enter your age"
                value={reg.age}
                onChange={update('age')}
                required
              />
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor="reg-sport">
                Sport type
              </label>
              <select
                id="reg-sport"
                className="ui-select"
                value={reg.sporttype}
                onChange={update('sporttype')}
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
          </div>

          <button type="submit" className="ui-btn ui-btn--primary register-btn" disabled={isLoding}>
            {isLoding ? 'Processing…' : 'Register'}
          </button>
        </form>

        <p className="register-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
