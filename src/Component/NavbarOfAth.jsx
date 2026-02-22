import React from 'react'
import { Link } from 'react-router-dom'

const NavbarOfAth = () => {

  return (
    <>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
          <Link className="navbar-brand text-white " to="#">Athelet</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon text-white"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav text-white">
              <li className="nav-item active">
                <Link className="nav-link text-white" to="/AtheletDashboard">Home</Link>
              </li>
              <li className="nav-item ">
                <Link className="nav-link text-white" to="/Schedule">Schedule</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/complian">Feedback</Link>
              </li>
              <li className="nav-item">
                {/* <Link className="nav-link text-white" onClick={()=>localStorage.removeItem("token"),window.location.href="/login"}>Logout</Link> */}
                <Link
                  className="nav-link text-white"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </Link>
              </li>



            </ul>
          </div>
        </nav>
      </div>
    </>
  )
}

export default NavbarOfAth