import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarCoach from './CoachComponents/NavbarCoach';
import { jwtDecode } from 'jwt-decode';
import api from './css/axiosConfig';
const CoachDashboard = () => {
  const navigate = useNavigate();
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
  return (
    <>
      <NavbarCoach />
      <div className='vh-100 bg-secondary'>Welcome <span className='text-primary'>{userdata.name}</span></div>

    </>
  )
}

export default CoachDashboard