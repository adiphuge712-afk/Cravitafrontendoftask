import React, { useEffect, useState } from 'react'
import NavbarOfAth from '../NavbarOfAth'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../AthletComponent/ComplainCoach.css';
const ComplainCoach = ({ user }) => {
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

  const [complain, setComplain] = useState({

    comment: "",
    difficultlevel: ""
  });
  const fectdata = async (e) => {
    e?.preventDefault();
    try {
      const data = await axios.post(`${import.meta.env.VITE_API_URL}/viewDataFeedback/${userdata.athid}`, complain);
      alert('Feedback send');

    } catch (err) {
      console.log(err);
      alert('fail');

    }
  }
  const [Loding, setLoding] = useState(false);
  useEffect(() => {
    const loddata = async () => {
      if (userdata) {
        try {

          setLoding(true);
          // await new Promise(resolve => setTimeout(resolve, 2000));// for checking the loding 
         

        } catch (error) {
          // console.log(error);
          alert("fail");
        } finally {
          setLoding(false);
        }
      }
    }
    loddata();
  }, [userdata])
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
      <div className="feedback-wrapper d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="feedback-card shadow rounded p-4">
          <h2 className="text-center text-primary mb-4">Feedback Form</h2>
          <form onSubmit={fectdata}>
            {/* Comment textarea */}
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">Your Comment</label>
              <textarea
                id="comment"
                name="comment"
                placeholder="Enter your comment..."
                value={complain.comment}
                onChange={(e) => setComplain({ ...complain, comment: e.target.value })}
                className="form-control"
                rows={4}
                required
              />
            </div>

            {/* Difficulty level select */}
            <div className="mb-4">
              <label htmlFor="difficultlevel" className="form-label">Difficulty Level</label>
              <select
                id="difficultlevel"
                name="difficultlevel"
                className="form-select"
                value={complain.difficultlevel}
                onChange={(e) => setComplain({ ...complain, difficultlevel: e.target.value })}
                required
              >
                <option value="">Select Difficulty Level</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn btn-primary w-100 btn-submit">Submit Feedback</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ComplainCoach