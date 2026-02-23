import React from 'react'
import Navbaradmin from './Navbaradmin'
import { useState,useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
const PerformaceLog = () => {
 const [userdata, setuserdata] = useState(null);
     useEffect(() => {
       const token = localStorage.getItem("token");
       if (token) {
         const decoded = jwtDecode(token);
         // console.log("Decoded data is : ",decoded.user);
         setuserdata(decoded.user || decoded);
       } else {
         window.location.href = "/login";
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