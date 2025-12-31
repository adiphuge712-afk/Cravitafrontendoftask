import React from 'react'
import {Link} from 'react-router-dom'
const Navbar = () => {
  return (
    <>
    
         <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
  <Link className="navbar-brand text-white " to="#">Navbar</Link>
  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon text-white"></span>
  </button>
  <div className="collapse navbar-collapse" id="navbarNav">
    <ul className="navbar-nav text-white">
      <li className="nav-item active">
        <Link className="nav-link text-white" to="/">Home</Link>
      </li>
        <li className="nav-item ">
        <Link className="nav-link text-white" to="/register">Register</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-white" to="/login">Login</Link>
      </li>
      
      
    </ul>
  </div>
</nav>
     
    </>
  )
}

export default Navbar