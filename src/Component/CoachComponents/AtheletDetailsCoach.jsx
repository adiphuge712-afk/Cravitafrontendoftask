import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
      <table className='table table-borderd border '>
        <thead className='table-primary'>
          <tr className='border'>
            <th>Sr.no</th>
            <th>Athelet Id</th>
            <th>Athelet Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Sport Type</th>
            {/* <th>Schedule Plan</th> */}
          </tr>
        </thead>
        <tbody className='table-secondary'>
          {coachdat.map((d, index) => (
            <tr key={d.athid}>
              <td>{index + 1}</td>
              <td>{d.athid}</td>
              <td>{d.name}</td>
              <td>{d.age}</td>
              <td>{d.email}</td>
              <td>{d.sporttype}</td>
              <td>
                {/* <button className='btn btn-primary' onClick={() => Scheduleplan(d.coachid.coachid)}>Schedule Plan</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default AtheletDetailsCoach