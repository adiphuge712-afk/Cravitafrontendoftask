import React, { useContext } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from './Context/UserContext';
import AdminDashboard from './AdminDashboard';
import AtheletDashboard from './AtheletDashboard';
import CoachDashboard from './CoachDashboard';
import FeedbackHistory from './AdminComponents/FeedbackHistory';
import './Login.css';

const Login = ({ user }) => {
  const [isLoding, setLoding] = useState(false);
  const [errormsg, seterrormsg] = useState("");
  const [succees, setsuccess] = useState("");
  // console.log(user);
  // const { setcontext } = useContext(UserContext);
  const navigate = useNavigate();
  const [logdata, setDate] = useState({
    email: "",
    password: "",
    role: ""
  });
  const formsubmit = async (e) => {
    e.preventDefault();
    seterrormsg("");
    setLoding(true);
    // await new Promise(resolve => setTimeout(resolve, 2000));// for checking the loding 
    try {

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, logdata);
      // setcontext(res.data);//sharethe data globle
      // console.log("full responsed is :", res.data);
      const token = res.data.token;
      localStorage.setItem("token", token);
      // alert('token is :',localStorage.getItem("token"));
      setsuccess("Login succees!!!!");
      setDate({
        name: "",
        email: "",
        password: "",
        role: ""
      });

      if (logdata.role == "Athelet") {
        navigate('/AtheletDashboard');
      } else if (logdata.role == "Admin") {
        navigate('/AdminDashboard');
      } else if (logdata.role == "Coach") {
        navigate('/CoachDashboard');
      } else {
        navigate('/login');
      }

    } catch (error) {
      console.log(error);
      // alert('fail');
      seterrormsg("Invalid email or password or role ????");
      navigate('/login');
    } finally {
      setLoding(false);
    }
  }


  return (
    <>
     {
        isLoding && (
          <div className="loader-overlay">
            <div className="loader-box">
              <div className="spinner-border" role="status"></div>
              <p className="loading-text">Loading...</p>
            </div>
          </div>
        )
      }
      <div className="login-page">
        <div className="login-card">
          <h2 className="login-title">Login</h2>

          <form onSubmit={formsubmit}>
            <div className="login-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={logdata.email}
                onChange={(e) =>
                  setDate({ ...logdata, email: e.target.value })
                }
                required
              />
            </div>

            <div className="login-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={logdata.password}
                onChange={(e) =>
                  setDate({ ...logdata, password: e.target.value })
                }
                required
              />
            </div>

            <div className="login-group">
              <label>Role</label>
              <select
                value={logdata.role}
                onChange={(e) =>
                  setDate({ ...logdata, role: e.target.value })
                }
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Coach">Coach</option>
                <option value="Athelet">Athlete</option>
              </select>
            </div>
            {succees && (
              <p className="msg-succees">{succees}</p>
            )}
            {errormsg && (
              <p className="error-message">{errormsg}</p>
            )}
            <button type="submit" className="login-btn" disabled={isLoding}>
              {isLoding ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
      {/* {isLoding && (
        <div className="loader-overlay">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )} */}
    </>
  )
}

export default Login