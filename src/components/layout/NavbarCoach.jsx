import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'
import './NavbarCoach.css'

/* Coach navbar - shares the structure/classes defined in Navbar.css. */
const LINKS = [
  { to: '/CoachDashboard', label: 'Dashboard' },
  { to: '/Traningplans', label: 'Training Plans' },
  { to: '/atheletscoach', label: 'Athletes' },
  { to: '/Schedulecoach', label: 'Schedule' },
  { to: '/AtheletsAndWorkdirl', label: 'Work Drill' },
  { to: '/Performancelog', label: 'Performance' },
  { to: '/feedbackhistorycoach', label: 'Feedback' },
]

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

const NavbarCoach = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="nav-bar nav-bar--coach" aria-label="Coach navigation">
      <div className="nav-bar__inner">
        <NavLink to="/CoachDashboard" className="nav-brand" onClick={close}>
          <span className="nav-brand__mark" aria-hidden="true">AA</span>
          <span className="nav-brand__text">Coach Panel</span>
          <span className="nav-brand__chip">Coach</span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu-coach"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <div
          id="nav-menu-coach"
          className={open ? 'nav-collapse is-open' : 'nav-collapse'}
        >
          <ul className="nav-links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={linkClass} onClick={close}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <NavLink
              to="/logout"
              className="nav-action nav-action--signout"
              onClick={close}
            >
              Logout
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavbarCoach
