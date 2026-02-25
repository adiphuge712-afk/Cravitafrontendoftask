import React from 'react'
import NavbarOfAth from '../NavbarOfAth'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../AthletComponent/TraningSchedule.css';
const TraningSchedule = ({ user }) => {
  const [userdata,setuserdata]=useState(null);
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      // console.log("Decoded data is : ",decoded.user);
       setuserdata(decoded.user|| decoded);
    }else{
       window.location.href = "/login";
    }
   },[]);

  const [athdata, setAthdata] = useState({
    
    request: ""
  });
  const [workdata, setworkdta] = useState([]);
  const fatchwork = async () => {
    try {
      if (userdata.coachid != null) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataWorkdrilByCoachid/${userdata.coachid.coachid}`);
        setworkdta(res.data);
        // console.log(res.data);
      }
      else {

        alert('Coach not assign yet ');
      }
    } catch (error) {
      console.log(error);
      if (!userdata) return <div>Loading...</div>;
    }
  }

  useEffect(() => {
   if(userdata){
    fatchwork();
   }
  }, [userdata]);


  const formsubmit = async (e) => {
    e?.preventDefault();
if (!userdata) return;
    console.log("Sending athdata:", athdata);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/addrequest/${userdata.athid}`,
        athdata,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      alert("Request sent successfully");

      setAthdata({
        
        request: ""
      });

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to add request");
    }
  }
if (!userdata) return <div>Loading...</div>;
  return (
   <>
  <NavbarOfAth />

  <div className="training-container">
    <h2 className="page-title">Training Schedule</h2>

    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Coach</th>
            <th>Experience</th>
            <th>Plan</th>
            <th>Workout</th>
            <th>Duration</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {workdata.map((d, index) => (
            <tr key={d.workid}>
              <td>{index + 1}</td>
              <td>{d.plan.coachid.name}</td>
              <td>{d.plan.coachid.experience} yrs</td>
              <td>{d.plan.planname}</td>
              <td>{d.workname}</td>
              <td>{d.duration} min</td>
              <td>{d.plan.startdate}</td>
              <td>{d.plan.enddate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {userdata.coachid == null && (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Request Coach</h3>
        <form onSubmit={formsubmit}>
          <textarea
            name="request"
            value={athdata.request}
            onChange={(e) =>
              setAthdata({ ...athdata, request: e.target.value })
            }
            placeholder="Write your request to admin..."
          />
          <button type="submit">Send Request</button>
        </form>
      </div>
    </div>
  )}
</>
  )
}

export default TraningSchedule