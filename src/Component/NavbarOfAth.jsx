import React from 'react'
import { Link } from 'react-router-dom'
import './NavbarOfAth.css';

const NavbarOfAth = () => {

  return (
    <>
      <div>
       <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="#">Athelet</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/AtheletDashboard">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Schedule">Schedule</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/complian">Feedback</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link logout-link" to="/logout">Logout</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
      </div>
    </>
  )
}

export default NavbarOfAth