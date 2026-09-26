import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Reads the signed-in user out of the stored JWT.
 *
 * Every dashboard and page used to repeat this same block - read token,
 * decode, redirect to /login on failure. Now it lives in one place (SRP),
 * so a change to how identity is stored is a single edit.
 *
 * @returns {{user: object|null, ready: boolean}} `ready` flips to true once
 *          the token has been examined, so callers can tell "still checking"
 *          apart from "definitely signed out".
 */
export default function useAuthUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // sessionStorage, not localStorage - see api/client.js for why: it keeps
    // this tab's signed-in identity independent of every other open tab.
    const token = sessionStorage.getItem('token');

    if (!token) {
      setReady(true);
      navigate('/login', { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded.user || decoded);
    } catch {
      sessionStorage.removeItem('token');
      navigate('/login', { replace: true });
    } finally {
      setReady(true);
    }
  }, [navigate]);

  return { user, ready };
}
