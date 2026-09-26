import api from '@/api/client';

/**
 * Subscribes to any one of the backend's live event streams - performance
 * (/admin|coach|athelet/sse/performance), coach requests
 * (/admin|athelet/sse/coach-requests), or schedule (/athelet|coach/sse/schedule).
 *
 * This deliberately does not use the browser's built-in EventSource: it has
 * no way to attach a custom header, and this backend's JwtFilter only reads
 * the token from an Authorization header, not a query string - the usual
 * EventSource workaround, and the one place a JWT would otherwise leak into
 * server access logs. Reading the stream by hand with fetch() keeps this
 * request authenticated exactly like every other one this app makes.
 *
 * @param {string} path      e.g. '/admin/sse/performance'
 * @param {Function} onEvent called with (payload, eventName) for each event -
 *                           a combined multi-topic stream (see
 *                           /athelet/sse/events) needs the name to tell its
 *                           topics apart; a single-topic subscriber can just
 *                           ignore the second argument
 * @returns {Function} unsubscribe - call to stop and close the connection
 */
export function subscribeToEvents(path, onEvent) {
  const controller = new AbortController();
  let stopped = false;

  (async () => {
    while (!stopped) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${api.defaults.baseURL}${path}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary;
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            const lines = rawEvent.split('\n');
            const dataLine = lines.find((line) => line.startsWith('data:'));
            if (!dataLine) continue;
            const nameLine = lines.find((line) => line.startsWith('event:'));

            try {
              onEvent(JSON.parse(dataLine.slice(5).trim()), nameLine ? nameLine.slice(6).trim() : undefined);
            } catch {
              // Malformed frame - skip it rather than breaking the stream.
            }
          }
        }
      } catch {
        if (stopped || controller.signal.aborted) return;
        // Connection dropped (network blip, server restart) - EventSource
        // reconnects on its own; this mirrors that instead of giving up.
      }

      if (!stopped) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  })();

  return () => {
    stopped = true;
    controller.abort();
  };
}
