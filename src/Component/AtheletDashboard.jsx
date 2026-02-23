import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import Logout from '../utils/Logout';
import NavbarOfAth from './NavbarOfAth';
import './AtheletDashboard.css';
import { jwtDecode } from 'jwt-decode';
const AtheletDashboard = ({user}) => {
const [userdata,setuserdata]=useState(null);
 useEffect(()=>{
   const token = localStorage.getItem("token");
   if (token) {
     const decoded = jwtDecode(token);
     console.log("Decoded data is : ",decoded.user);
      setuserdata(decoded.user|| decoded);
   }else{
      window.location.href = "/login";
   }
  },[]);

if (!userdata) return <div>Loading...</div>;
  return (
  <>
  <div className='navstiky'>
    <NavbarOfAth/>
  </div>
   
   <div className='dashboardheight bg-secondary  text-white '>
    <h2 className='text-primary'>Welcome <span className='text-info'>{userdata.name}</span></h2>
    
     </div>

   
  
  </>
  )
}

export default AtheletDashboard