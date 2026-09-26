/**
 * Turns raw Performancelog rows from the backend into chart-ready series.
 *
 * This is what replaced the hardcoded
 *   `const data = [{ month: "Jan", performance: 30 }, ...]`
 * that used to sit at the top of the dashboards. Nothing here invents a
 * value: every number is counted from rows the API actually returned, and
 * a month with no logs is reported as 0 rather than filled in.
 */

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * A log counts as done only on an exact "Completed" status - not a fuzzy
 * substring match. That match used to be /complete|done|yes/i, which also
 * matches "Not Completed" (it contains "Completed"), so setting a drill back
 * to not-complete had no visible effect anywhere except the raw log-history
 * text, which just prints the string as-is.
 */
export function isCompleted(log) {
  return String(log?.completestatus ?? '').trim().toLowerCase() === 'completed';
}

/**
 * `date` arrives as a LocalDate, which Jackson serialises either as
 * "2026-09-21" or as [2026, 9, 21]. Handle both, and return null for
 * anything unparseable so it can be skipped rather than guessed at.
 */
export function parseLogDate(value) {
  if (!value) return null;

  if (Array.isArray(value) && value.length >= 3) {
    return new Date(value[0], value[1] - 1, value[2]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Builds one bucket per month for the last `months` months, ending with
 * the current month.
 *
 * @returns {Array<{month: string, completed: number, logged: number, completionRate: number}>}
 */
export function buildMonthlyTrend(logs, months = 6, now = new Date()) {
  const buckets = [];
  const index = new Map();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = { month: MONTH_LABELS[d.getMonth()], completed: 0, logged: 0, completionRate: 0 };
    index.set(key, bucket);
    buckets.push(bucket);
  }

  for (const log of Array.isArray(logs) ? logs : []) {
    const date = parseLogDate(log?.date);
    if (!date) continue;

    const bucket = index.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!bucket) continue;

    bucket.logged += 1;
    if (isCompleted(log)) bucket.completed += 1;
  }

  for (const bucket of buckets) {
    bucket.completionRate = bucket.logged
      ? Math.round((bucket.completed / bucket.logged) * 100)
      : 0;
  }

  return buckets;
}

/** Headline numbers for the stat tiles - all counted, none invented. */
export function summarisePerformance(logs) {
  const rows = Array.isArray(logs) ? logs : [];
  const completed = rows.filter(isCompleted).length;

  return {
    total: rows.length,
    completed,
    pending: rows.length - completed,
    completionRate: rows.length ? Math.round((completed / rows.length) * 100) : 0,
  };
}
