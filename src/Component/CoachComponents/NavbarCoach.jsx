import React from 'react'
import { Link } from 'react-router-dom'
const NavbarCoach = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
        <Link className="navbar-brand text-white " to="#">Coach</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon text-white"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav text-white">
            <li className="nav-item active">
              <Link className="nav-link text-white" to="/CoachDashboard">Home</Link>
            </li>
            <li className="nav-item ">
              <Link className="nav-link text-white" to="/Traningplans">Traningplans</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/atheletscoach">Athelets </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Schedulecoach">Schedule</Link>
            </li>
            <li className="nav-item active">
              <Link className="nav-link text-white" to="/AtheletsAndWorkdirl">AtheletsAndWorkdirl</Link>
            </li>
            <li className="nav-item active">
              <Link className="nav-link text-white" to="/Performancelog">PerformanceLog</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/feedbackhistorycoach">Feedback_History</Link>

            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Logout</Link>
            </li>

          </ul>
        </div>
      </nav>
    </>
  )
}

export default NavbarCoach