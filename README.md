# Cravita — Frontend

React + Vite frontend for the Cravita sports academy platform. Three role-based
dashboards (Admin, Coach, Athlete), JWT auth against the Spring Boot backend, a
forgot-password wizard backed by an email OTP, and dashboards that update live
over Server-Sent Events instead of needing a manual refresh.

## Stack

- React 19, Vite 7
- React Router 7
- Axios
- Recharts (performance trend charts — built from real API data, never
  hardcoded sample data)
- Bootstrap (base styles) + a small custom design-token system in
  `src/styles/theme.css` for everything added on top of it
- react-icons, jwt-decode

## Project layout

```
src/
├── api/          one module per backend area (adminApi, coachApi, athleteApi,
│                 authApi, sse) - pages call these, never a raw axios/fetch call
├── components/
│   ├── common/   shared, reusable UI: Loader, StatCard, StateMessage,
│   │             PerformanceTrendChart, CoachRequestModal
│   └── layout/   the four navbars (public / admin / coach / athlete)
├── context/      UserContext
├── hooks/        useAuthUser (reads the JWT once), useAsync (load/error/data
│                 for one API call), useCoachRequest (the "ask for a coach"
│                 flow), useLiveEvents (subscribes a page to its SSE stream)
├── pages/        admin/ · coach/ · athlete/ · auth/ - one folder per role
├── routes/       ProtectedRoute
├── styles/       theme.css - design tokens every page builds on
└── utils/        performance.js (real chart data from API rows), Logout.js
```

## Running locally

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. Requires the backend running on `:8056` (see
the backend README) — set `VITE_API_URL` in `.env` if it's somewhere else:

```
VITE_API_URL=http://localhost:8056
```

To log in with something other than a fresh registration, run
`../reset_and_seed_demo_data.sql` (one level up, next to this repo and the
backend repo) against your local database — it resets it to a clean state
and creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cravita.com` | `123456` |
| Coach | `coach@cravita.com` | `123456` |
| Athlete | `athlete@cravita.com` | `123456` |
| Athlete | `priya@cravita.com` | `123456` |

These aren't live on any hosted instance — they only exist once you've run
that script yourself against your own database. See the backend README for
the full details (what else the script adds, the non-destructive
`add_athlete_priya_sharma.sql` alternative); it's destructive, so it's meant
to be run deliberately in a query tool, not automatically.

## Building

```bash
npm run build    # production build, output in dist/
npm run lint     # eslint over the whole project
```

## Sessions: sessionStorage, not localStorage

The JWT is stored in `sessionStorage`, not `localStorage`. `localStorage` is
shared by every tab and window open to the same origin — so signing in as a
different role (or account) in one tab silently overwrote the token every
other open tab was reading, and that tab's next request would authenticate as
whoever logged in most recently anywhere in the browser. `sessionStorage` is
scoped to one tab: each tab keeps its own independent session, and logging out
in one tab cannot affect another. Every read/write of the token
(`api/client.js`, `useAuthUser`, `ProtectedRoute`, `Login.jsx`, `Logout.jsx`)
goes through `sessionStorage` consistently — if you add a new place that needs
the token, use `sessionStorage`, not `localStorage`.

One consequence: opening a new tab to this app does not carry over an
existing session the way it would with `localStorage` — sign in again in that
tab. That's the intended trade-off, not a bug.

## Live updates (Server-Sent Events)

Dashboards reload their own data automatically when it changes elsewhere -
a coach recording a result shows up on that athlete's dashboard without a
refresh, a new drill shows up on the schedule it belongs to, an admin sees a
new coach-request the moment it's submitted.

- `api/sse.js` — `subscribeToEvents(path, onEvent)` reads an SSE stream by
  hand with `fetch()`, not the browser's built-in `EventSource`.
  `EventSource` cannot attach a custom header, and this backend's auth only
  reads a bearer token from an `Authorization` header, not a query string —
  the usual `EventSource` workaround, and the one place a JWT would otherwise
  leak into server access logs. Reading the stream manually keeps it
  authenticated exactly like every other request this app makes, and
  reconnects automatically on a dropped connection.
- `hooks/useLiveEvents.js` — the hook every page actually uses:
  `useLiveEvents(path, onEvent, enabled)`. `onEvent` receives `(payload,
  eventName)`; most callers only need `eventName` to decide what to reload.

**One connection per page, not one per topic.** A page that cares about
several event types subscribes to one combined backend endpoint
(`/admin/sse/events`, `/coach/sse/events`, `/athelet/sse/events`) instead of
opening a separate connection per topic, and tells them apart by `eventName`.
This matters because browsers cap concurrent HTTP/1.1 connections to a single
origin at 6 - several long-lived SSE streams per tab, especially with more
than one tab of this app open, can exhaust that budget and stall the page's
own ordinary data-fetching requests, which looks exactly like the page
hanging on its loading spinner. If you add a new live-updating page that
needs more than one event type, use the combined endpoint for its role, not
a new single-topic one.

**What this cannot do**: update `hasCoach`/`coachid` on an athlete's own
dashboard. Those come from the JWT decoded once at login - a snapshot the
database change behind a live event doesn't touch. When a coach is assigned
to an already-signed-in athlete, the dashboard shows an honest banner asking
them to refresh, rather than pretending it updated itself.

## Conventions

- **No page calls axios directly.** Every backend call goes through
  `src/api/*.js`. If a page needs a new endpoint, add a function there first.
- **No hand-rolled auth blocks.** `useAuthUser()` reads and decodes the JWT and
  redirects to `/login` on failure — every authenticated page uses it instead
  of repeating that logic.
- **No `alert()`.** Failures render inline (`StateMessage`, an `ui-alert`
  banner) with a retry action where one makes sense; a browser alert blocks
  the whole page and tells the user nothing they can act on.
- **Dashboards show real data only.** Chart series and stat tiles are derived
  from actual API responses (`src/utils/performance.js`) — if you're tempted
  to add a placeholder array "just for now," don't; render an empty/loading
  state instead until real data is wired up.
- **"Total" means every possible assignment, not just logged ones.** A drill
  nobody has logged a result against yet is still a pending assignment, not
  invisible — counting only logged rows made 6-out-of-8 real assignments
  read as "100% complete" once the other 2 had simply never been touched.
  Where this matters (the athlete dashboard, the coach dashboard and
  Performance Log page, the admin per-coach breakdown), the total is athletes
  × drills, computed locally on that page rather than in the shared
  `summarisePerformance`/`buildMonthlyTrend` util in `utils/performance.js` -
  that util is also used by pages that haven't been audited for this yet, so
  changing its definition there would silently change them too.
- **Styling.** New UI should reach for the `ui-*` classes in
  `src/styles/theme.css` (cards, tables, forms, badges, buttons, modals)
  before writing new CSS, including `ui-filter-bar` for a row of filter
  fields above a table. Page-specific `.css` files should only contain what
  the shared classes don't already cover, and should reference the `--c-*` /
  `--space-*` tokens rather than new hardcoded colors or spacing.
- **A filter narrows the list, not the summary.** Stat tiles and trend charts
  above a filtered table keep summarising every row, not just the ones
  currently visible — the filter only changes what the table below shows.

## Known gaps

- Some pages still bind directly to a matching backend entity shape (e.g. the
  coach-edit form used to expose a password field — now removed) — worth
  checking any "edit" form for fields that shouldn't be there before shipping
  it.
- The admin dashboard's top-level "Training completion" chart still uses the
  shared `buildMonthlyTrend` — logged rows only, not total possible
  assignments — unlike the per-coach breakdown further down the same page,
  which does use the total-assignments definition. Not yet reconciled.
- An already-signed-in athlete's dashboard cannot show a newly assigned coach
  without a refresh (see "Live updates" above) — this is a property of the
  JWT, not something more live-update wiring can fix.
- No automated frontend tests yet (this app doesn't have any at the time of
  writing) — verification has been manual: `npm run build` + `npx eslint` +
  exercising the flow against a running backend, including live end-to-end
  checks of the SSE streams against the real running server.
