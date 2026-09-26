import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async loader and tracks loading/error/data around it.
 *
 * Replaces the pattern of a try/catch plus `alert('fail to fetch data')`
 * that was copied into every page. Errors become state the UI can render
 * properly instead of a browser dialog the user has to dismiss.
 *
 * @param {Function} loader     async function returning the data
 * @param {Array}    deps       re-run when these change
 * @param {object}   options    { enabled, initialData }
 */
export default function useAsync(loader, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await run());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Something went wrong while loading this data.',
      );
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await run();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Something went wrong while loading this data.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [run, enabled]);

  return { data, loading, error, reload };
}
