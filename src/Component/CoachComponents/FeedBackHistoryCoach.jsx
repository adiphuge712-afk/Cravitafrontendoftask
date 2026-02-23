import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './FeedbackHistoryCoach.css';

const FeedBackHistoryCoach = ({ user }) => {
    const [userdata, setuserdata] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            console.log("Decoded data is : ",decoded.user);
            setuserdata(decoded.user || decoded);
        } else {
            window.location.href = "/login";
        }
    }, []);
    const [coachdat, setCoachData] = useState([]);
    const [performanceid, setPerformance] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataFeedback/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    const fetchperformance = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataPerformancelog/${userdata.coachid}`);
            // alert('datafatch');
            setPerformance(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    //for merch
    const mergedCoachData = coachdat.map(item => ({
        ...item,
        performances: performanceid.filter(p =>
            p.athid.athid === item.athid.athid &&
            p.workid.plan.coachid.coachid === userdata.coachid
        )
    }));
    console.log("the mergedat is " + mergedCoachData);

    useEffect(() => {
        if (userdata) {

            fectdata();
            fetchperformance();
        }
    }, [userdata]);
    if (!userdata) return <div>Loading...</div>;
    return (
        <>
  <NavbarCoach />

  <div className="feedback-page">
    <h2 className="feedback-title">Athlete Feedback Overview</h2>

    <div className="feedback-table-wrapper">
      <table className="feedback-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Comment</th>
            <th>Difficulty</th>
            <th>Athlete ID</th>
            <th>Name</th>
            <th>Sport</th>
            <th>Work</th>
            <th>Plan</th>
          </tr>
        </thead>

        <tbody>
          {mergedCoachData.length > 0 ? (
            mergedCoachData.map((c, index) => (
              <tr key={c.feedid}>
                <td>{index + 1}</td>

                <td className="comment-cell">
                  {c.comment}
                </td>

                <td>
                  <span className={`difficulty-badge ${c.difficultlevel.toLowerCase()}`}>
                    {c.difficultlevel}
                  </span>
                </td>

                <td>{c.athid.athid}</td>
                <td>{c.athid.name}</td>

                <td>
                  <span className="sport-badge">
                    {c.athid.sporttype}
                  </span>
                </td>

                <td>
                  {c.performances.length > 0
                    ? c.performances.map(p => p.workid.workname).join(", ")
                    : "No Work"}
                </td>

                <td>
                  {c.performances.length > 0
                    ? [...new Set(
                        c.performances.map(p => p.workid.plan.planname)
                      )].join(", ")
                    : "No Plan"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data">
                No Feedback Available
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

export default FeedBackHistoryCoach