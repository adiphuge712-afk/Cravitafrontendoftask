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

   const [workdata, setworkdta] = useState([]);
  const fatchwork = async () => {
    try {
      if (userdata.coachid != null) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataWorkdrilByTodaysdateandCoachid/${userdata.coachid.coachid}`);
        setworkdta(res.data);
        console.log(res.data);
      }
      else {

        alert('Coach not assign yet ');
      }
    } catch (error) {
      console.log(error);
      if (!userdata) return <div>Loading...</div>;
    }
  }

  const statusupdate=async (id)=>{
    alert('work id is '+id);
  }
   useEffect(() => {
      if(userdata){
        
      fatchwork();
      }
    }, [userdata]);
  

if (!userdata) return <div>Loading...</div>;
  return (
  <>
  <NavbarOfAth/>
   <div className="dashboard">

      {/* Sidebar */}
      {/* <div className="sidebar">
        <h2>🏋️ Athlete</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>My Plan</li>
          <li>Progress</li>
          <li>Messages</li>
          <li>Profile</li>
          <li className="logout">Logout</li>
        </ul>
      </div> */}

      {/* Main Content */}
      <div className="main-content">

        {/* Header */}
        <div className="header">
          <h1>Welcome, {userdata.name} 👋</h1>
          <p>Current Plan: Strength Training Phase 1</p>
        </div>

        {/* Stats Cards */}
        {/* <div className="stats">
          <div className="card">
            <h3>12</h3>
            <p>Sessions Completed</p>
          </div>
          <div className="card">
            <h3>85%</h3>
            <p>Attendance</p>
          </div>
          <div className="card">
            <h3>72 kg</h3>
            <p>Current Weight</p>
          </div>
          <div className="card">
            <h3>7.8</h3>
            <p>Performance Score</p>
          </div>
        </div> */}

        {/* Training Section */}
        <div className="training-section">
          <h2>Today's Training</h2>
          <table>
            <thead>
              <tr>
                <th>sr.no</th>
                <th>Exercise</th>
                <th>Plan Name</th>
                <th>Duration</th>
                <th>Plan Start Date</th>
                <th>Plan End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workdata.map((d, index) => (
            <tr key={d.workid}>
              <td>{index + 1}</td>
              <td>{d.workname}</td>
              <td>{d.plan.planname}</td>
              <td>{d.duration} min</td>
              <td>{d.plan.startdate}</td>
              <td>{d.plan.enddate}</td>
              <td>
                  <button onClick={() => statusupdate(d.workid)} className="complete-btn">Mark Complete</button>
                </td>
            </tr>
          ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
   </>
  )
}

export default AtheletDashboard