import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../AdminComponents/Navbaradmin.css';
const Navbaradmin = () => {

  return (
   <>
  <nav className="admin-navbar navbar navbar-expand-lg">

    <div className="container-fluid">

      <Link className="navbar-brand admin-brand" to="/AdminDashboard">
        Admin Panel
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#adminNavbar"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="adminNavbar">
        <ul className="navbar-nav ms-auto">

          <li className="nav-item">
            <Link className="nav-link" to="/AdminDashboard">
              Dashboard
            </Link>
          </li>
 <li className="nav-item">
            <Link className="nav-link" to="/requestcoach">
            Request of athelets
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/addcoach">
              Register Coach
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/atheletdetails">
              Athlete Info
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/Coachinfo">
              Coach Info
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/feedbackhistory">
              Feedback
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link logout-btn" to="/logout">
              Logout
            </Link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</>
  )
}

export default Navbaradmin