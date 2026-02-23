import React from 'react'
import { Link } from 'react-router-dom'
import '../CoachComponents/NavbarCoach.css';
const NavbarCoach = () => {
  return (
    <>
  <nav className="coach-navbar navbar navbar-expand-lg">

    <div className="container-fluid">

      <Link className="navbar-brand coach-brand" to="/CoachDashboard">
        Coach Panel
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#coachNavbar"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="coachNavbar">
        <ul className="navbar-nav ms-auto">

          <li className="nav-item">
            <Link className="nav-link" to="/CoachDashboard">
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/Traningplans">
              Training Plans
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/atheletscoach">
              Athletes
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/Schedulecoach">
              Schedule
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/AtheletsAndWorkdirl">
              Work Drill
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/Performancelog">
              Performance
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/feedbackhistorycoach">
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

export default NavbarCoach