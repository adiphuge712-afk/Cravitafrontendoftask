import React from 'react'
import Navbaradmin from './Navbaradmin'

const Assingedworks = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
  }
  return (
    <>
      <Navbaradmin />
      <div>Assingedworks</div>
    </>
  )
}

export default Assingedworks