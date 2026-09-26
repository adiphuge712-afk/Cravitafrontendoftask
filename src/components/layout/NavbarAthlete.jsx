import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'
import './NavbarAthlete.css'

/* Athlete navbar - shares the structure/classes defined in Navbar.css. */
const LINKS = [
  { to: '/AtheletDashboard', label: 'Home' },
  { to: '/Schedule', label: 'Schedule' },
  { to: '/complian', label: 'Feedback' },
]

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

const NavbarOfAth = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="nav-bar nav-bar--athlete" aria-label="Athlete navigation">
      <div className="nav-bar__inner">
        <NavLink to="/AtheletDashboard" className="nav-brand" onClick={close}>
          <span className="nav-brand__mark" aria-hidden="true">AA</span>
          <span className="nav-brand__text">Athlete Panel</span>
          <span className="nav-brand__chip">Athlete</span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu-athlete"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <div
          id="nav-menu-athlete"
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

export default NavbarOfAth
