//  import React from 'react'
//  import {useNavigate} from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios';
//  import NavbarOfAth from './NavbarOfAth';
import Navbaradmin from "./AdminComponents/Navbaradmin";
// ;
//  const AdminDashboard = ({user}) => {
//  //      const [data,setShow]=useState(null);
//  //     const navigate=useNavigate();

// // // //    const show=async()=>
// // // //    {
// // // //      try {
// // // //         const t=await axios.get(`${import.meta.env.VITE_API_URL}/checksessionadmin`,{});
// // // //         setShow(true);
// // // //     } catch (error) {
// // // //         console.log(error);
// // // //         navigate('/login');
// // // //     }
// // // //    }
// // //    useEffect(async()=>{
// // //  try {
// // //         const t=await axios.get("http://localhost:8056/checksessionadmin",{});
// // //         setShow(true);
// // //     } catch (error) {
// // //         console.log(error);
// // //         navigate('/login');
// // //     }
// // //    },[])
//   return (
//     <>
//    <Navbaradmin/>

//     <div className='vh-100 bg-info'>
//     {/* <h2>Welcome {user.name}</h2> */}
//       </div>
//     </>
//    )
// }

//  export default AdminDashboard


import React from "react";
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
import "./AdminDashboard.css";

const data = [
  { month: "Jan", performance: 30 },
  { month: "Feb", performance: 45 },
  { month: "Mar", performance: 40 },
  { month: "Apr", performance: 60 },
  { month: "May", performance: 80 },
  { month: "Jun", performance: 70 },
];

// const athletes = [
//   {
//     name: "Alex Johnson",
//     attendance: 85,
//     status: "Active",
//     img: "https://randomuser.me/api/portraits/men/1.jpg",
//   },
//   {
//     name: "Emma Davis",
//     attendance: 70,
//     status: "Training",
//     img: "https://randomuser.me/api/portraits/women/2.jpg",
//   },
//   {
//     name: "Michael Lee",
//     attendance: 95,
//     status: "Injured",
//     img: "https://randomuser.me/api/portraits/men/3.jpg",
//   },
//   {
//     name: "Sophia Martinez",
//     attendance: 60,
//     status: "Inactive",
//     img: "https://randomuser.me/api/portraits/women/4.jpg",
//   },
// ];

const AdminDashboard = () => {
  const [athletes, setAthdata] = useState([]);
  const fatchdata = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataAthlet`);
      setAthdata(res.data);
    } catch (error) {
      console.log(error);
      alert('fail to fetch data');
    }
  }
  const [coachdata, setCoachData] = useState([]);
  const fetachcoach = async () => {
    try {
      const coach = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataCoach`);
      // alert('datafatch');
      setCoachData(coach.data);
    } catch (err) {
      console.log(err);
      alert('fail');

    }
  }

  useEffect(() => {
    // caoch();
    fetachcoach();
    fatchdata();
  }, []);
  return (
    <>
      <Navbaradmin />
      <div className="dashboard">
        {/* Sidebar
      <div className="sidebar">
        <h2 className="logo">Sports Academy</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>Coaches</li>
          <li>Athletes</li>
          <li>Attendance</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>
      </div> */}

        {/* Main Content */}
        <div className="main">
          {/* Stats Cards */}
          <div className="cards">
            <div className="card">
              <FaUserTie className="icon indigo" />
              <h3>{coachdata.length}</h3>
              <p>Coaches</p>
            </div>

            <div className="card">
              <FaUsers className="icon blue" />
              <h3>{athletes.length}</h3>
              <p>Athletes</p>
            </div>

            {/* <div className="card">
            <FaCalendarCheck className="icon green" />
            <h3>92%</h3>
            <p>Attendance</p>
          </div> */}

            {/* <div className="card">
            <FaComments className="icon orange" />
            <h3>4.8</h3>
            <p>Feedback</p>
          </div> */}
          </div>

          {/* Chart Section */}
          <div className="chart-container">
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

          {/* Athlete Table */}
          <div className="table-container">
            <h3>Athletes List</h3>
            <table>
              <thead>
                <tr>
                  <th>Athelet Name</th>
                  <th>Sport Type</th>
                  <th>Coach Name</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete, index) => (
                  <tr key={index}>
                    <td className="athlete-info">
                      {/* <img src={athlete.img} alt="profile" /> */}
                      {athlete.name}
                    </td>
                    <td>
                      {/* <div className="progress-bar">
                       <div
                        className="progress"
                        style={{ width: `${athlete.attendance}%` }}
                      ></div> 
                    </div> */}
                      {athlete.sporttype}
                    </td>
                    <td>
                      {/* <span className={`badge ${athlete.status.toLowerCase()}`}>
                      {athlete.coachid.name}sir
                    </span> */}
                      {athlete?.coachid?.name || <span className='text-danger'><b>Coach not assigned</b></span>} sir
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>);
};

export default AdminDashboard;
