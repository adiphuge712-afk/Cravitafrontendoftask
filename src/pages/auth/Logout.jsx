import { useEffect } from 'react';

import Loader from '@/components/common/Loader';
import authApi from '@/api/authApi';

/**
 * Clears the session, revokes the token server-side, and bounces back to
 * the public sign-in page.
 *
 * The JWT itself is otherwise stateless and valid for 24 hours - without
 * calling the backend, "logout" would only mean *this browser* forgets the
 * token, while the exact same token stays fully usable by anyone else
 * holding a copy of it until it naturally expires. authApi.logout() revokes
 * it immediately, server-side, so it stops working right away either way.
 *
 * That call is best-effort: if it fails (network down, or the token was
 * already invalid), the user is signed out locally regardless - a failed
 * revoke request must never trap someone on a logout screen.
 *
 * The final navigation is a hard browser reload (`window.location.href`),
 * not React Router's `navigate()`. A router-only navigation swaps the
 * rendered route but leaves the whole JavaScript context alive - any
 * dashboard already mounted elsewhere keeps whatever it fetched into memory
 * before logout, and pressing back could still show it. A full reload
 * discards every component's in-memory state along with the token, so
 * nothing from the previous session can be looked at again after logging out.
 */
const Logout = () => {
  useEffect(() => {
    (async () => {
      try {
        await authApi.logout();
      } catch {
        // Best-effort - proceed to clear the local session either way.
      } finally {
        // sessionStorage, not localStorage - see api/client.js for why: this
        // clears only this tab's session, exactly as it should.
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    })();
  }, []);

  return <Loader overlay label="Signing you out…" />;
};

export default Logout;
