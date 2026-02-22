import React from 'react'
import Navbaradmin from './Navbaradmin'
const PerformaceLog = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
  }
  return (<>
    <Navbaradmin />

    <div>PerformaceLog</div>
  </>
  )
}

export default PerformaceLog