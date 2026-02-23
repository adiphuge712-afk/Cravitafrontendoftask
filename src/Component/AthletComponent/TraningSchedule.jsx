import React from 'react'
import NavbarOfAth from '../NavbarOfAth'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const TraningSchedule = ({ user }) => {
  const [userdata,setuserdata]=useState(null);
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("Decoded data is : ",decoded.user);
       setuserdata(decoded.user|| decoded);
    }else{
       window.location.href = "/login";
    }
   },[]);

  const [athdata, setAthdata] = useState({
    
    request: ""
  });
  const [workdata, setworkdta] = useState([]);
  const fatchwork = async () => {
    try {
      if (userdata.coachid != null) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataWorkdrilByCoachid/${userdata.coachid.coachid}`);
        setworkdta(res.data);
        console.log(res.data);
      }
      else {

        alert('Coach not assign yet ');
      }
    } catch (error) {
      console.log(error);
      if (!userdata) return <div>Loading...</div>;
    }
  }

  useEffect(() => {
    
    fatchwork();
  }, [userdata]);


  const formsubmit = async (e) => {
    e?.preventDefault();
if (!userdata) return;
    console.log("Sending athdata:", athdata);

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

      alert("Request sent successfully");

      setAthdata({
        
        request: ""
      });

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to add request");
    }
  }
if (!userdata) return <div>Loading...</div>;
  return (
    <>
      <NavbarOfAth />
      <table className='table table-bordered border border-dark '>
        <thead className='table-primary'>
          <tr className='border-start'>

            <th>Work id</th>
            <th>Coach Name</th>
            <th>Work Experience</th>
            <th>Planname</th>

            <th>Workname</th>
            <th>Duration</th>
            <th>StartDate</th>
            <th>EndDate</th>

          </tr>
        </thead>
        <tbody className='table-secondary '>
          {
            workdata.map((d, index) => (
              <tr key={d.workid} className='border-start'>

                <td>{index + 1}</td>
                <td>{d.plan.coachid.name} sir</td>
                <td>{d.plan.coachid.experience} years</td>
                <td>{d.plan.planname}</td>
                <td>{d.workname}</td>
                <td>{d.duration} Min</td>
                <td>{d.plan.startdate}</td>
                <td>{d.plan.enddate}</td>

              </tr>
            ))
          }
        </tbody>
      </table>
      {
        userdata.coachid == null && (
          <div className='align-content-center position-fixed top-20 start-0 w-100 h-100 bg-dark  bg-opacity-75' style={{ zIndex: 1040 }}>

            <div className="row mb-4">
              <div className="col-sm-4"></div>
              <div className="col-sm-4 border shadow bg-light rounded p-3">
                <form onSubmit={formsubmit} >
                  <h3 className='text-center'>Request for coach</h3>
                  {/* <input type="text" value={athdata.athid} name="athid" className='form-control mb-2' placeholder='athid' /> */}
                  <textarea type="text" name='request' value={athdata.request} onChange={(e) => setAthdata({ ...athdata, request: e.target.value })} className='form-control my-2' placeholder='Add the Feedd back to direct admin for coach request ' />
                  <button type="submit" className='btn btn-primary w-100'>Update</button>

                </form>
              </div>
              <div className="col-sm-4"></div>
            </div>
          </div>
        )
      }
    </>
  )
}

export default TraningSchedule