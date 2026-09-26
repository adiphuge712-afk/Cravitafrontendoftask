import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'
import './NavbarAdmin.css'

/* Admin navbar - shares the structure/classes defined in Navbar.css. */
const LINKS = [
  { to: '/AdminDashboard', label: 'Dashboard' },
  { to: '/requestcoach', label: 'Request of Athletes' },
  { to: '/addcoach', label: 'Register Coach' },
  { to: '/atheletdetails', label: 'Athlete Info' },
  { to: '/Coachinfo', label: 'Coach Info' },
  { to: '/feedbackhistory', label: 'Feedback' },
]

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

const Navbaradmin = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="nav-bar nav-bar--admin" aria-label="Admin navigation">
      <div className="nav-bar__inner">
        <NavLink to="/AdminDashboard" className="nav-brand" onClick={close}>
          <span className="nav-brand__mark" aria-hidden="true">AA</span>
          <span className="nav-brand__text">Admin Panel</span>
          <span className="nav-brand__chip">Admin</span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu-admin"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <div
          id="nav-menu-admin"
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

export default Navbaradmin
