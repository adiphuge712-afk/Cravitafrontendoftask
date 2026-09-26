import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import authApi from '@/api/authApi';
import './Login.css';

/** Where each role lands after a successful sign-in. */
const HOME_BY_ROLE = {
  Athelet: '/AtheletDashboard',
  Admin: '/AdminDashboard',
  Coach: '/CoachDashboard',
};

/**
 * Public sign-in page.
 *
 * Deliberately does NOT use useAuthUser - that hook bounces anyone without a
 * token to /login, which from here would be an infinite loop.
 */
const Login = () => {
  const navigate = useNavigate();
  const [isLoding, setLoding] = useState(false);
  const [errormsg, seterrormsg] = useState('');
  const [succees, setsuccess] = useState('');
  const [logdata, setDate] = useState({
    email: '',
    password: '',
    role: '',
  });

  const update = (field) => (e) => {
    setDate((prev) => ({ ...prev, [field]: e.target.value }));
    seterrormsg('');
  };

  const formsubmit = async (e) => {
    e.preventDefault();
    seterrormsg('');
    setsuccess('');
    setLoding(true);

    try {
      const data = await authApi.login(logdata);
      // sessionStorage, not localStorage - see api/client.js for why.
      sessionStorage.setItem('token', data.token);
      setsuccess('Login successful — taking you to your dashboard…');
      setDate({ email: '', password: '', role: '' });
      navigate(HOME_BY_ROLE[logdata.role] || '/login');
    } catch (error) {
      seterrormsg(
        error?.response?.data?.message ||
          'We could not sign you in. Check your email, password and role, then try again.',
      );
    } finally {
      setLoding(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-head">
          <span className="login-mark" aria-hidden="true">
            CV
          </span>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your Cravita account</p>
        </div>

        {succees && (
          <div className="ui-alert ui-alert--success login-alert" role="status">
            {succees}
          </div>
        )}
        {errormsg && (
          <div className="ui-alert ui-alert--error login-alert" role="alert">
            {errormsg}
          </div>
        )}

        <form className="ui-form" onSubmit={formsubmit}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="ui-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={logdata.email}
              onChange={update('email')}
              required
            />
          </div>

          <div className="ui-field">
            <div className="login-label-row">
              <label className="ui-label" htmlFor="login-password">
                Password
              </label>
              <Link to="/forgot-password" className="login-forgot">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              className="ui-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={logdata.password}
              onChange={update('password')}
              required
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="login-role">
              Role
            </label>
            <select
              id="login-role"
              className="ui-select"
              value={logdata.role}
              onChange={update('role')}
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Coach">Coach</option>
              <option value="Athelet">Athlete</option>
            </select>
          </div>

          <button type="submit" className="ui-btn ui-btn--primary login-btn" disabled={isLoding}>
            {isLoding ? 'Processing…' : 'Sign In'}
          </button>
        </form>

        <p className="login-foot">
          New athlete? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
