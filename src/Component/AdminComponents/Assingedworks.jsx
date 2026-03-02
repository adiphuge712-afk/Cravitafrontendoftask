import React from 'react'
import Navbaradmin from './Navbaradmin'
import { useNavigate } from 'react-router-dom';

const Assingedworks = () => {
  const navigate=useNavigate();
  const token = localStorage.getItem("token");
             if (!token) {
              navigate('/login');
             }
             try {
               const decoded = jwtDecode(token);
               // console.log("Decoded data is : ",decoded.user);
               setuserdata(decoded.user || decoded);
             } catch (error) {
               navigate('/login');
             }
  return (
    <>
      <Navbaradmin />
      <div>Assingedworks</div>
    </>
  )
}

export default Assingedworks