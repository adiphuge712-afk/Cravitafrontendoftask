import { useEffect, useRef } from 'react';
import { subscribeToEvents } from '@/api/sse';

/**
 * Subscribes to any one of the backend's live event streams and calls
 * `onEvent` for each push. The event payload itself is intentionally not
 * the source of truth for most callers - they use it only as a signal to
 * reload from the REST endpoint they already call, which stays correctly
 * scoped per role by the same AccessGuard checks as every other read in
 * this app. A caller that does need the payload (e.g. to tell "request
 * submitted" apart from "coach assigned") can still read it directly.
 *
 * @param {string} path      e.g. '/admin/sse/performance'
 * @param {Function} onEvent called with (payload, eventName) on every push
 * @param {boolean} enabled  skip subscribing until this is true (e.g. until the user id is known)
 */
export default function useLiveEvents(path, onEvent, enabled = true) {
  // Callers pass a fresh callback on every render; a plain effect dependency
  // on it would tear down and reopen the connection each time. The ref keeps
  // the latest callback without doing that - updated in its own effect (not
  // during render) since mutating a ref while rendering is unsafe under
  // concurrent rendering.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const unsubscribe = subscribeToEvents(path, (event, eventName) => onEventRef.current(event, eventName));
    return unsubscribe;
  }, [path, enabled]);
}
