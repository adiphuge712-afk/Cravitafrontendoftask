import React from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../AdminComponents/FeedbackHistory.css';
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

  <div className="admin-page">
    <div className="table-card">
      <h3 className="table-title">Feedback History</h3>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th className="text-start">Comment</th>
              <th>Difficulty</th>
              <th>Coach ID</th>
              <th>Coach</th>
              <th>Coach Email</th>
              <th>Athlete ID</th>
              <th>Athlete</th>
              <th>Athlete Email</th>
            </tr>
          </thead>

          <tbody>
            {coachdat.map((d, index) => (
              <tr key={d.feedid}>
                <td>{index + 1}</td>

                <td className="comment-cell">
                  {d.comment}
                </td>

                <td>
                  <span className={`difficulty-badge ${d.difficultlevel}`}>
                    {d.difficultlevel}
                  </span>
                </td>

                <td>{d.athid?.coachid?.coachid}</td>
                <td>{d.athid?.coachid?.name} Sir</td>
                <td>{d.athid?.coachid?.email}</td>
                <td>{d.athid?.athid}</td>
                <td>{d.athid?.name}</td>
                <td>{d.athid?.email}</td>
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

export default FeedbackHistory