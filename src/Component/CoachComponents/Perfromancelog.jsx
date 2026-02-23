import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../CoachComponents/Performancelog.css';
const Perfromancelog = ({ user }) => {
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
    const [coachdat, setCoachData] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataPerformancelog/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }

    useEffect(() => {
        if(userdata){
            fectdata();
        }
    }, [userdata]);
if (!userdata) return <div>Loading...</div>;
    return (
        <>
  <NavbarCoach />

  <div className="log-page">
    <h2 className="log-title">Athlete Performance Logs</h2>

    <div className="log-table-wrapper">
      <table className="log-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Fatigue</th>
            <th>Performance</th>
            <th>Coach</th>
            <th>Athlete ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Workout</th>
          </tr>
        </thead>

        <tbody>
          {coachdat.length > 0 ? (
            coachdat.map((d, index) => (
              <tr key={d.logid}>
                <td>{index + 1}</td>
                <td>{d.date}</td>

                <td>
                  <span className={`fatigue-badge ${d.fatiquelevel.toLowerCase()}`}>
                    {d.fatiquelevel}
                  </span>
                </td>

                <td>
                  <span className={`performance-badge ${d.performancematrix.toLowerCase()}`}>
                    {d.performancematrix}
                  </span>
                </td>

                <td>{d.athid.coachid.name}</td>
                <td>{d.athid.athid}</td>
                <td>{d.athid.name}</td>
                <td>{d.athid.email}</td>
                <td>{d.workid.workname}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No Performance Logs Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</>
    )
}

export default Perfromancelog