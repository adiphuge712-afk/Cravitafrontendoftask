import { useMemo, useState } from 'react';

import Navbaradmin from '@/components/layout/NavbarAdmin';
import Loader from '@/components/common/Loader';
import StateMessage from '@/components/common/StateMessage';
import adminApi from '@/api/adminApi';
import useAuthUser from '@/hooks/useAuthUser';
import useAsync from '@/hooks/useAsync';
import './CoachDetails.css';

/** Kept identical to the list the register-coach form offers. */
const SPORTS = [
  'Cricket',
  'Kho-Kho',
  'Carrom',
  'Chess',
  'Mallakhamb',
  'Volleyball',
  'Football',
];

/**
 * Coach management: list, edit and delete.
 *
 * Same three actions as before, but the browser dialogs are gone - deleting
 * asks in a themed modal and every outcome lands in an inline banner, so a
 * failed update no longer costs the admin their unsaved form.
 */
const CoachDetails = () => {
  const { user, ready } = useAuthUser();
  const enabled = Boolean(user);

  const coaches = useAsync(() => adminApi.getCoaches(), [], { enabled, initialData: [] });

  const [edit, setEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone, text }
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const list = coaches.data || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    return list.filter((c) =>
      [c?.name, c?.email, c?.specialization]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [coaches.data, search]);

  const describeError = (err, fallback) =>
    err?.response?.data?.message || err?.message || fallback;

  const runDelete = async () => {
    setBusy(true);
    setFeedback(null);

    try {
      await adminApi.deleteCoach(confirmDelete.coachid);
      setConfirmDelete(null);
      await coaches.reload();
      setFeedback({ tone: 'success', text: `${confirmDelete.name} was removed.` });
    } catch (err) {
      setFeedback({ tone: 'error', text: describeError(err, 'That coach could not be deleted.') });
      setConfirmDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    try {
      // Only the fields this form actually edits - never the whole row (which
      // still carries coachid/role/adid from the list) and never a password:
      // this is a profile editor, not a password-change screen. Resetting a
      // coach's password goes through Forgot Password on their own account.
      const payload = {
        name: edit.name,
        email: edit.email,
        age: edit.age,
        specialization: edit.specialization,
        experience: edit.experience,
      };
      await adminApi.updateCoach(edit.coachid, payload);
      const name = edit.name;
      setEdit(null);
      await coaches.reload();
      setFeedback({ tone: 'success', text: `${name}'s profile was updated.` });
    } catch (err) {
      setFeedback({ tone: 'error', text: describeError(err, 'That profile could not be updated.') });
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <Loader overlay label="Checking your session…" />;

  return (
    <>
      <Navbaradmin />

      <div className="ui-page">
        <header className="ui-page-header">
          <div>
            <h1 className="ui-page-title">Coach management</h1>
            <p className="ui-page-subtitle">
              Edit a coach&apos;s profile or remove them from the academy.
            </p>
          </div>
        </header>

        {feedback && (
          <div
            className={`ui-alert ui-alert--${feedback.tone === 'success' ? 'success' : 'error'} coach-banner`}
            role="status"
          >
            <span>{feedback.text}</span>
          </div>
        )}

        <section className="ui-card">
          <div className="ui-card__head">
            <h2 className="ui-card__title">Coaches</h2>
            <p className="ui-card__caption">
              {coaches.loading ? 'Loading…' : `${rows.length} shown`}
            </p>
          </div>

          <div className="ui-card__body">
            <div className="ui-toolbar">
              <input
                type="search"
                className="ui-input ui-search"
                placeholder="Search by name, email or specialization"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search coaches"
              />
            </div>

            {coaches.loading ? (
              <Loader label="Loading coaches…" />
            ) : coaches.error ? (
              <StateMessage title="Could not load coaches" tone="error" onRetry={coaches.reload}>
                {coaches.error}
              </StateMessage>
            ) : (coaches.data?.length ?? 0) === 0 ? (
              <StateMessage title="No coaches registered yet">
                Use “Register Coach” in the navigation to add the first one.
              </StateMessage>
            ) : rows.length === 0 ? (
              <StateMessage title="No coaches match that search">
                Nothing matched “{search}”. Clear the search box to see everyone.
              </StateMessage>
            ) : (
              <div className="ui-table-wrap">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Registered by</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d, index) => (
                      <tr key={d.coachid}>
                        <td>{index + 1}</td>
                        <td>{d.name}</td>
                        <td className="ui-muted">{d.email}</td>
                        <td>{d.age || '—'}</td>
                        <td>
                          <span className="ui-badge ui-badge--neutral">
                            {d.specialization || '—'}
                          </span>
                        </td>
                        <td>{d.experience ?? '—'}</td>
                        <td className="ui-muted ui-nowrap">
                          {d.adid ? `${d.adid.adminid} - ${d.adid.name}` : '—'}
                        </td>
                        <td>
                          <div className="ui-row-actions">
                            <button
                              type="button"
                              className="ui-btn ui-btn--sm"
                              onClick={() => {
                                setFeedback(null);
                                setEdit(d);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="ui-btn ui-btn--danger ui-btn--sm"
                              onClick={() => {
                                setFeedback(null);
                                setConfirmDelete(d);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ---------- delete confirmation (replaces window.confirm) ---------- */}
      {confirmDelete && (
        <div
          className="ui-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
        >
          <div className="ui-modal coach-modal--narrow">
            <div className="ui-modal__head">
              <h3 className="ui-modal__title">Delete this coach?</h3>
            </div>
            <div className="ui-modal__body">
              <p className="coach-confirm-text">
                <strong>{confirmDelete.name}</strong> will be removed from the academy. This cannot
                be undone.
              </p>
            </div>
            <div className="ui-modal__foot">
              <button
                type="button"
                className="ui-btn"
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--danger"
                onClick={runDelete}
                disabled={busy}
              >
                {busy ? 'Deleting…' : 'Delete coach'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- edit profile ---------- */}
      {edit && (
        <div
          className="ui-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Update coach profile"
        >
          <div className="ui-modal">
            <div className="ui-modal__head">
              <h3 className="ui-modal__title">Update coach profile</h3>
              <button
                type="button"
                className="ui-btn ui-btn--sm"
                onClick={() => setEdit(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit}>
              <div className="ui-modal__body">
                <input type="hidden" value={edit.coachid} readOnly />

                <div className="ui-form-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="coach-name">Coach name</label>
                    <input
                      id="coach-name"
                      type="text"
                      className="ui-input"
                      value={edit.name ?? ''}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                      placeholder="Coach Name"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="coach-email">Email</label>
                    <input
                      id="coach-email"
                      type="email"
                      className="ui-input"
                      value={edit.email ?? ''}
                      onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="coach-experience">Experience</label>
                    <input
                      id="coach-experience"
                      type="text"
                      className="ui-input"
                      value={edit.experience ?? ''}
                      onChange={(e) => setEdit({ ...edit, experience: e.target.value })}
                      placeholder="Experience"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="coach-specialization">Specialization</label>
                    <select
                      id="coach-specialization"
                      className="ui-select"
                      value={edit.specialization ?? ''}
                      onChange={(e) => setEdit({ ...edit, specialization: e.target.value })}
                      required
                    >
                      <option value="">Select Sport</option>
                      {SPORTS.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ui-field">
                    <label className="ui-label" htmlFor="coach-age">Age</label>
                    <input
                      id="coach-age"
                      type="number"
                      className="ui-input"
                      value={edit.age ?? ''}
                      onChange={(e) => setEdit({ ...edit, age: e.target.value })}
                      placeholder="Age"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="ui-modal__foot">
                <button type="button" className="ui-btn" onClick={() => setEdit(null)}>
                  Cancel
                </button>
                <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Update coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachDetails;
