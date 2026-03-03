import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarCoach from './CoachComponents/NavbarCoach';
import { jwtDecode } from 'jwt-decode';
import api from './css/axiosConfig';
import './CoachDashbord.css';
import {
  FaUsers,
  FaUserTie,
  FaCalendarCheck,
  FaComments,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const data = [
  { month: "Jan", performance: 30 },
  { month: "Feb", performance: 45 },
  { month: "Mar", performance: 40 },
  { month: "Apr", performance: 60 },
  { month: "May", performance: 80 },
  { month: "Jun", performance: 70 },
];
const CoachDashboard = () => {
  const navigate = useNavigate();
  const [userdata, setuserdata] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
    }
    try {
      const decoded = jwtDecode(token);
      // console.log("Decoded data is : ",decoded.user);
      setuserdata(decoded.user || decoded);
    } catch (error) {
      navigate('/login');
    }
  }, []);
  const [athletes, setAthdata] = useState([]);
  const fatchdata = async () => {
    try {
      const res = await api.get(`/coach/viewDataAthlet`);
      setAthdata(res.data);
    } catch (error) {
      console.log(error);
      alert('fail to fetch data');
    }
  }
  const [coachdata, setCoachData] = useState([]);
  const fetachcoach = async () => {
    try {
      const coach = await api.get(`/coach/viewDataCoach`);
      // alert('datafatch');
      setCoachData(coach.data);
    } catch (err) {
      console.log(err);
      alert('fail');

    }
  } 
  const [Loding, setLoding] = useState(false);
    useEffect(() => {
      // caoch();
      const lodedata = async () => {
        try {
          if (userdata) {
            setLoding(true);
            // await new Promise(resolve => setTimeout(resolve, 2000));// for checking the loding
            await fetachcoach();
            await fatchdata();
          }
        } catch (error) {
          console.log("error is :", error);
          alert("fail to load the apiss");
        } finally {
          setLoding(false);
        }
      }
      lodedata();
    }, [userdata]);
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
      <NavbarCoach/>
      {/* <div className='vh-100 bg-secondary'>Welcome <span className='text-primary'>{userdata.name}</span></div> */}
      <div className="cards">
        <div className="card">
          <FaUserTie className="icon indigo" />
          <h3 className='text-start mt-2'>Hiee {userdata.name}</h3>
          <p className='text-start'>Welcome to Ayush academy</p>
        </div>

        <div className="card">
          <FaUsers className="icon blue" />
          <h3>{athletes.length}</h3>
          <p>Athletes</p>
        </div>
      </div>

          {/* Chart Section */}
          <div className="chart-container shadow rounded bg-white m-2">
            <h3>Athlete Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="performance"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorPerformance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

    </>
  )
}

export default CoachDashboard