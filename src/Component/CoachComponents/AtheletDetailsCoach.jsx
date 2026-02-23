import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../CoachComponents/AtheletDetailsCoach.css';
const AtheletDetailsCoach = ({ user }) => {
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
      const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataAthletCoach/${userdata.coachid}`);
      // alert('datafatch');
      setCoachData(data.data);
    } catch (err) {
      console.log(err);
      alert('fail to fatch the athelets or loding');

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

  <div className="coach-container">
    <h2 className="coach-title">Athlete Details</h2>

    <div className="table-wrapper">
      <table className="coach-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Sport</th>
          </tr>
        </thead>
        <tbody>
          {coachdat.length > 0 ? (
            coachdat.map((d, index) => (
              <tr key={d.athid}>
                <td>{index + 1}</td>
                <td>{d.athid}</td>
                <td>{d.name}</td>
                <td>{d.age}</td>
                <td>{d.email}</td>
                <td>
                  <span className="sport-badge">{d.sporttype}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No Athletes Found
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

export default AtheletDetailsCoach