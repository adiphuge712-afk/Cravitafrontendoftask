import React from 'react'
import NavbarCoach from './NavbarCoach'
import axios from 'axios';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../CoachComponents/Scheduleplan.css';
const Scheduleplan = ({ user }) => {
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
    const [reg, setRegister] = useState({
        planname: "",
        plantype: "",
        startdate: "",
        enddate: ""
    });
    const navigate = useNavigate();
    const formsubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/addPlan/${userdata.coachid}`, reg);
            alert("Plan Add");
            setRegister({
                planname: "",
                plantype: "",
                startdate: "",
                enddate: ""
            });
            navigate("/Traningplans");

        } catch (error) {
            console.log(error);
            alert('fail');
        }
    }

if (!userdata) return <div>Loading...</div>;
    return (
      <>
  <NavbarCoach />

  <div className="schedule-page">
    <div className="schedule-card">
      <h2 className="schedule-title">Schedule Training Plan</h2>

      <form onSubmit={formsubmit}>

        <div className="form-group">
          <label>Plan Name</label>
          <input
            type="text"
            placeholder="Enter Plan Name"
            value={reg.planname}
            onChange={(e) =>
              setRegister({ ...reg, planname: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Plan Type</label>
          <input
            type="text"
            placeholder="Enter Plan Type"
            value={reg.plantype}
            onChange={(e) =>
              setRegister({ ...reg, plantype: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={reg.startdate}
            onChange={(e) =>
              setRegister({ ...reg, startdate: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={reg.enddate}
            onChange={(e) =>
              setRegister({ ...reg, enddate: e.target.value })
            }
            required
          />
        </div>

        <button type="submit" className="schedule-btn">
          Create Plan
        </button>

      </form>
    </div>
  </div>
</>
    )
}

export default Scheduleplan