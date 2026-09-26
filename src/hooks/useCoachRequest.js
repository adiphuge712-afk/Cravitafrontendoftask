import { useCallback, useEffect, useState } from 'react';
import athleteApi from '@/api/athleteApi';

/**
 * The "ask the admin for a coach" flow, shared by every screen that needs it.
 *
 * <p>Extracted after the same logic, duplicated inline in one page, was
 * getting two real bugs:
 * <ul>
 *   <li>it compared the fetched request to the literal boolean {@code true}
 *       (`coachRequest.data === true`), but the endpoint returns either
 *       {@code null} or the actual request object - so "you already asked"
 *       never once matched a request loaded from the server, only ones just
 *       submitted in the current tab;</li>
 *   <li>it treated "we haven't loaded yet" and "we loaded and there is
 *       nothing" as the same state (both look like {@code data === null}),
 *       so an athlete who had genuinely never asked for a coach could see
 *       the request form flash in and out, or never appear at all, instead
 *       of appearing once loading is actually done.</li>
 * </ul>
 * Having one implementation means fixing it once fixes it everywhere it is used.
 */
export default function useCoachRequest(athleteId, hasCoach) {
  const [existingRequest, setExistingRequest] = useState(undefined); // undefined = not loaded yet
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [justRequested, setJustRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!athleteId || hasCoach) return;
    setLoading(true);
    setLoadError('');
    try {
      // The backend returns the request object, or null if none exists yet -
      // never a bare boolean.
      setExistingRequest(await athleteApi.getMyCoachRequest(athleteId));
    } catch (err) {
      setLoadError(err?.response?.data?.message || 'Could not check your coach request status.');
    } finally {
      setLoading(false);
    }
  }, [athleteId, hasCoach]);

  useEffect(() => { load(); }, [load]);

  // A coach's own dashboard identity (hasCoach, coachid) is decoded from the
  // JWT issued at login - a snapshot, not a live read. Assigning a coach
  // changes the database row, not that token, so this cannot silently flip
  // hasCoach the way the rest of this app's live features can just reload a
  // REST call. What it CAN honestly do is tell the athlete it happened, so
  // they know to refresh instead of wondering why nothing changed.
  const [coachAssignedLive, setCoachAssignedLive] = useState(false);

  // This hook does not open its own SSE connection - it is only ever used
  // from AtheletDashboard, which already subscribes once to the combined
  // /athelet/sse/events stream and forwards coach-request-shaped events here
  // via handleLiveEvent. A second, dedicated connection for this one topic
  // would put the athlete dashboard right back to multiple concurrent
  // long-lived connections, which is the exact problem that stream exists
  // to avoid (see Mycontroller.subscribeAllEvents).
  const handleLiveEvent = useCallback((event) => {
    if (event?.type === 'coach-assigned') {
      setCoachAssignedLive(true);
    } else if (event?.type === 'request-submitted') {
      load();
    }
  }, [load]);

  const submit = useCallback(
    async (message) => {
      if (!athleteId) return;
      setSubmitting(true);
      setSubmitError('');
      try {
        await athleteApi.requestCoach(athleteId, { request: message });
        setJustRequested(true);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'Failed to send your request. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [athleteId],
  );

  // "known" means the initial load has actually finished - not merely that
  // the placeholder value happens to be falsy.
  const requestKnown = existingRequest !== undefined && !loading && !loadError;
  const hasRequested = justRequested || Boolean(existingRequest);

  return {
    requestKnown,
    loading,
    loadError,
    hasRequested,
    reload: load,
    submit,
    submitting,
    submitError,
    coachAssignedLive,
    handleLiveEvent,
  };
}
