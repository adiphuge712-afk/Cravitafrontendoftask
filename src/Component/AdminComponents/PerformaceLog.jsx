import React from 'react'
import Navbaradmin from './Navbaradmin'
import { useState,useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
const PerformaceLog = () => {
  const navigate=useNavigate();
 const [userdata, setuserdata] = useState(null);
     useEffect(() => {
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
     }, []);
     if (!userdata) return <div>Loading...</div>;
  return (<>
    <Navbaradmin />

    <div>PerformaceLog</div>
  </>
  )
}

export default PerformaceLog