import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbaradmin = () => {

  return (
    <>

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
        <Link className="navbar-brand text-white " to="#">Admin</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon text-white"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav text-white">
            <li className="nav-item active">
              <Link className="nav-link text-white" to="/AdminDashboard">Home</Link>
            </li>
            <li className="nav-item ">
              <Link className="nav-link text-white" to="/addcoach">Coach_Register</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/atheletdetails">Athelet_Info</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Coachinfo">Coach_info</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/feedbackhistory">Feedback_History</Link>

            </li>
            {/* <li className="nav-item">
              <Link className="nav-link text-white" onClick={()=>{localStorage.removeItem("token");
                window.location.href="/login";
              }}>Logout</Link>
            </li> */}
              <li className="nav-item">
              <Link className="nav-link text-white" to="/logout">Logout</Link>

            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

export default Navbaradmin