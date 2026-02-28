import React from 'react'
import NavbarOfAth from '../NavbarOfAth'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../AthletComponent/TraningSchedule.css';
const TraningSchedule = ({ user }) => {
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

        // alert('Coach not assign yet ');
      }
    } catch (error) {
      console.log(error);
      if (!userdata) return <div>Loading...</div>;
    }
  }
  const [Loding, setLoding] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [showRequestMessage, setShowRequestMessage] = useState(true);
  const checkRequestStatus = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/viewrequestbyathelet/${userdata.athid}`
      );

      setHasRequested(res.data);

      if (res.data === true) {
        setShowRequestMessage(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const loddata = async () => {
      if (userdata) {
        try {

          setLoding(true);
          // await new Promise(resolve => setTimeout(resolve, 2000));// for checking the loding 
          await fatchwork();
          await checkRequestStatus();

        } catch (error) {
          // console.log(error);
          alert("fail");
        } finally {
          setLoding(false);
        }
      }
    }
    loddata();
  }, [userdata]);


  const formsubmit = async (e) => {
    e?.preventDefault();
    if (!userdata) return;
    console.log("Sending athdata:", athdata);
    setLoding(true);
    // await new Promise(resolve => setTimeout(resolve, 2000));// for checking the loding 
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

      // alert("Request sent successfully");
      setHasRequested(true);

      setAthdata({

        request: ""
      });

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to add request");
    }finally{
      setLoding(false);
    }
  }
  if (!userdata) return <div className="loader-overlay">
    <div className="loader-box">
      <div className="spinner-border" role="status"></div>
      <p className="loading-text">Loading...</p>
    </div>
  </div>;
  return (
    <>
      {
        Loding && (
          <div className="loader-overlay">
            <div className="loader-box">
              <div className="spinner-border" role="status"></div>
              <p className="loading-text">Loading...</p>
            </div>
          </div>
        )
      }
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
      {/* Show message if already requested */}
      {/* {userdata.coachid == null && hasRequested && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Request Already Sent</h3>
            <p style={{ marginTop: "10px" }}>
              You have already sent a request. Please wait for admin approval.
            </p>
          </div>
        </div>
      )} */}
      {userdata.coachid == null && hasRequested && showRequestMessage && (
        <div className="modal-overlay">
          <div className="modal-box">

            <div className='buttun-close'>
              <button
              className="close-btn"
              onClick={() => setShowRequestMessage(false)}
            >
              ✕
            </button>
            </div>

            <h3>Request Already Sent</h3>
            <p className="modal-message">
              You have already sent a request. Please wait for admin approval.
            </p>
          </div>
        </div>
      )}
      {userdata.coachid == null && !hasRequested && (
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
              <button type="submit"disabled={Loding} className='w-100' >{Loding?"Processing...":"Send Request"}</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default TraningSchedule