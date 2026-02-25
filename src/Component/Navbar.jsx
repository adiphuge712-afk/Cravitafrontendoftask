import React from 'react'
import {Link} from 'react-router-dom'
import './Navbar.css';
const Navbar = () => {
  return (
 <>
  <nav className="modern-navbar navbar navbar-expand-lg">
    <div className="container">

      <Link className="navbar-brand brand-logo" to="/">
        Aayush<span>Academy</span>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav align-items-center">

          <li className="nav-item">
            <Link className="nav-link modern-link" to="/">Home</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link modern-link" to="/register">Register</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link modern-link" to="/login">Login</Link>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</>
  )
}

export default Navbar