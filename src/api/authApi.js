import axios from 'axios';
import api from '@/api/client';

/**
 * Login/registration. These are the only endpoints the backend leaves
 * public, so they are grouped apart from the role-scoped modules.
 *
 * They deliberately use their own axios instance rather than `@/api/client`:
 * the shared client treats any 401 as "session expired" and hard-redirects to
 * /login, which would wipe the page before a failed sign-in could show its
 * error. On a public endpoint a 401 means "wrong credentials", so it has to
 * reach the caller untouched.
 */
const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const authApi = {
  /**
   * One endpoint for every role - the role is part of the request body, not
   * the URL. This used to post to /athelet/login even when signing in as an
   * admin or coach, because all three role controllers carried an identical
   * copy of the same login method.
   */
  login: ({ email, password, role }) =>
    publicClient.post('/auth/login', { email, password, role }).then((r) => r.data),

  registerAthlete: (payload) =>
    publicClient.post('/athelet/registerathlet', payload).then((r) => r.data),

  // --- forgot password: request a code, verify it, then set a new password ---

  /** Always resolves for a well-formed address, whether or not it is registered. */
  forgotPassword: (email) =>
    publicClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  /** Resolves to { message, resetToken } - the token authorises the final step. */
  verifyOtp: (email, otp) =>
    publicClient.post('/auth/verify-otp', { email, otp }).then((r) => r.data),

  resetPassword: (email, resetToken, newPassword) =>
    publicClient.post('/auth/reset-password', { email, resetToken, newPassword }).then((r) => r.data),

  /**
   * Revokes the current token server-side, so it stops working immediately
   * instead of remaining valid (to anyone holding a copy of it) until its
   * natural 24-hour expiry. Uses the authenticated client on purpose - the
   * request needs the current Authorization header attached to say which
   * token to revoke.
   */
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

export default authApi;
