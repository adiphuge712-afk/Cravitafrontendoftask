import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

/* Public navbar. Same structure as the role navbars:
   brand left, links right, account affordance on the far right. */
const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/register', label: 'Register' },
]

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="nav-bar nav-bar--public" aria-label="Main navigation">
      <div className="nav-bar__inner">
        <NavLink to="/" className="nav-brand" onClick={close}>
          <span className="nav-brand__mark" aria-hidden="true">AA</span>
          <span className="nav-brand__text">
            Aayush<span className="nav-brand__accent">Academy</span>
          </span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu-public"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <div
          id="nav-menu-public"
          className={open ? 'nav-collapse is-open' : 'nav-collapse'}
        >
          <ul className="nav-links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={linkClass}
                  onClick={close}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <NavLink
              to="/login"
              className="nav-action nav-action--primary"
              onClick={close}
            >
              Login
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
