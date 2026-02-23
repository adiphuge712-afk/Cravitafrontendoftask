import React from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
const FeedbackHistory = ({ user }) => {
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
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
  }
  const [coachdat, setCoachData] = useState([]);
  // const [edit, sededit] = useState(null);
  const fectdata = async () => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataFeedback`);
      // alert('datafatch');
      setCoachData(data.data);
    } catch (err) {
      console.log(err);
      alert('fail');

    }
  }
  useEffect(() => {
    fectdata();
  }, []);
if (!userdata) return <div>Loading...</div>;
  return (
    <>
      <Navbaradmin />

      <table className='table  table-bordered border '>
        <thead className=' table-danger'>
          <tr className='text-center  border'>
            <th>FeedBackId</th>
            <th className='text-start' >Comment</th>
            <th>DificultLevel</th>
            <th>CoachId</th>
            <th>Coach Name</th>
            <th>Coach Email</th>
            <th>AtheletId</th>
            <th>Athelet Name</th>
            <th>Athelet Email</th>
          </tr>
        </thead>
        <tbody className='table-secondary'>
          {coachdat.map((d, index) => (
            <tr key={d.feedid} className='text-center'>
              <td  >{index + 1}</td>
              <td className='text-start'>{d.comment}</td>
              <td>{d.difficultlevel}</td>
              <td >{d.athid.coachid.coachid} </td>
              <td>{d.athid.coachid.name} sir</td>
              <td>{d.athid.coachid.email}</td>
              <td  >{d.athid.athid}</td>
              <td>{d.athid.name}</td>
              <td>{d.athid.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default FeedbackHistory