import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';

import authApi from '@/api/authApi';
import './ForgotPassword.css';

const STEPS = [
  { key: 'email', label: 'Your email' },
  { key: 'otp', label: 'Verify code' },
  { key: 'password', label: 'New password' },
];

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;
const MIN_PASSWORD = 6;

/** Pull the backend's message out, whatever shape the failure took. */
function messageFrom(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);

  const redirectTimer = useRef(null);

  // Countdown for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const requestCode = useCallback(
    async (isResend = false) => {
      setError('');
      setNotice('');
      setBusy(true);
      try {
        const res = await authApi.forgotPassword(email.trim());
        setNotice(res?.message || 'If that email is registered, a code is on its way.');
        setCooldown(RESEND_SECONDS);
        if (!isResend) setStepIndex(1);
      } catch (err) {
        setError(messageFrom(err, 'Could not send the code. Please try again.'));
      } finally {
        setBusy(false);
      }
    },
    [email],
  );

  const submitEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter the email address on your account.');
      return;
    }
    requestCode(false);
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (otp.trim().length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setBusy(true);
    try {
      const res = await authApi.verifyOtp(email.trim(), otp.trim());
      setResetToken(res.resetToken);
      setStepIndex(2);
      setNotice('Code verified. Choose a new password.');
    } catch (err) {
      // The backend counts down remaining attempts in this message.
      setError(messageFrom(err, 'That code was not accepted.'));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await authApi.resetPassword(email.trim(), resetToken, password);
      setDone(true);
      redirectTimer.current = setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(messageFrom(err, 'Could not reset the password. Please start again.'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="fp-page">
        <div className="fp-card fp-card--done">
          <span className="fp-done-icon"><FaCheckCircle /></span>
          <h1 className="fp-title">Password updated</h1>
          <p className="fp-lede">You can sign in with your new password now.</p>
          <Link to="/login" className="ui-btn ui-btn--primary">Go to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-page">
      <div className="fp-card">
        <Link to="/login" className="fp-back"><FaArrowLeft /> Back to sign in</Link>

        <h1 className="fp-title">Reset your password</h1>
        <p className="fp-lede">
          {stepIndex === 0 && 'Enter your account email and we will send you a 6-digit code.'}
          {stepIndex === 1 && <>Enter the code sent to <strong>{email}</strong>.</>}
          {stepIndex === 2 && 'Choose a new password for your account.'}
        </p>

        <ol className="fp-steps" aria-label="Progress">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className={
                i === stepIndex ? 'fp-step fp-step--current'
                  : i < stepIndex ? 'fp-step fp-step--done' : 'fp-step'
              }
              aria-current={i === stepIndex ? 'step' : undefined}
            >
              <span className="fp-step__dot">{i < stepIndex ? '✓' : i + 1}</span>
              <span className="fp-step__label">{step.label}</span>
            </li>
          ))}
        </ol>

        {error && <div className="ui-alert ui-alert--error" role="alert">{error}</div>}
        {notice && !error && <div className="ui-alert ui-alert--info">{notice}</div>}

        {stepIndex === 0 && (
          <form className="ui-form" onSubmit={submitEmail}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="fp-email">Email address</label>
              <div className="fp-input-icon">
                <FaEnvelope aria-hidden="true" />
                <input
                  id="fp-email"
                  className="ui-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
            </div>
            <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </form>
        )}

        {stepIndex === 1 && (
          <form className="ui-form" onSubmit={submitOtp}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="fp-otp">6-digit code</label>
              <input
                id="fp-otp"
                className="ui-input fp-otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={busy}
                required
              />
              <span className="fp-hint">The code expires 10 minutes after it was sent.</span>
            </div>

            <div className="ui-form-actions">
              <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
                {busy ? 'Checking…' : 'Verify code'}
              </button>
              <button
                type="button"
                className="ui-btn"
                onClick={() => requestCode(true)}
                disabled={busy || cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--sm"
                onClick={() => { setStepIndex(0); setOtp(''); setError(''); setNotice(''); }}
                disabled={busy}
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {stepIndex === 2 && (
          <form className="ui-form" onSubmit={submitPassword}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="fp-pw">New password</label>
              <div className="fp-input-icon">
                <FaLock aria-hidden="true" />
                <input
                  id="fp-pw"
                  className="ui-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder={`At least ${MIN_PASSWORD} characters`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor="fp-pw2">Confirm new password</label>
              <div className="fp-input-icon">
                <FaLock aria-hidden="true" />
                <input
                  id="fp-pw2"
                  className="ui-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
              {confirm && password !== confirm && (
                <span className="ui-field__error">The two passwords do not match.</span>
              )}
            </div>

            <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="fp-footnote">
          <FaShieldAlt aria-hidden="true" /> For your safety we never say whether an address is
          registered — if the account exists, the code is on its way.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
