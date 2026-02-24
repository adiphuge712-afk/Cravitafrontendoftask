import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../CoachComponents/Traningschedulescoach.css';
const Traningschedulescoach = ({ user }) => {
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
    const [edit, sededit] = useState(null);
    const [workdata, setWorkdata] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail to fatech or loding');

        }
    }
    const deletestudent = async (id) => {
        // alert("id is "+id);
        if (window.confirm('Are your Sure???')) {
            try {
                const del = await axios.delete(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${id}`,{ withCredentials: true });
                if (del.data) {
                    // alert('deleted data');
                    fectdata();

                }
            } catch (error) {
                console.log(error);
                alert("Data not deleted");
            }
        }
    }
    const profileedit = async (d) => {
        sededit(d);
    }
    const formedit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${edit.planid}`, edit);
            alert('Data is Updated');
            sededit(null);
            fectdata();
        } catch (error) {
            console.log(error);
            alert('Data not updated!!!!!!');
        }
    }
    const Workdriladd = async (id) => {
        // alert('plain id is '+id);
        sededit(null);
        setWorkdata({
            "planid": id,
            "workname": "",
            "intencity": "",
            "duration": ""
        })

    }
    const workdrilladd = async (e) => {
        e.preventDefault();
        try {
            const del = await axios.post(`${import.meta.env.VITE_API_URL}/addwork/${workdata.planid}`, workdata);
            if (del.data) {
                alert('DRIL IS ADD');
                setWorkdata(null);

            }
        } catch (error) {
            console.log(error);
            alert("Data not deleted");
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

  <div className="plan-page">
    <h2 className="plan-title">Training Plans</h2>

    <div className="table-wrapper">
      <table className="plan-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Plan Name</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
            <th>Workout</th>
          </tr>
        </thead>

        <tbody>
          {coachdat.length > 0 ? (
            coachdat.map((d, index) => (
              <tr key={d.planid}>
                <td>{index + 1}</td>
                <td>{d.planname}</td>
                <td>
                  <span className="type-badge">
                    {d.plantype}
                  </span>
                </td>
                <td>{d.startdate}</td>
                <td>{d.enddate}</td>

                <td className="action-buttons">
                  <button
                    className="btn-delete"
                    onClick={() => deletestudent(d.planid)}
                  >
                    Delete
                  </button>

                  <button
                    className="btn-edit"
                    onClick={() => profileedit(d)}
                  >
                    Edit
                  </button>
                </td>

                <td>
                  <button
                    className="btn-work"
                    onClick={() => Workdriladd(d.planid)}
                  >
                    Add Workdrill
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                No Training Plans Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
           {edit && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Edit Training Plan</h3>

      <form onSubmit={formedit}>
        <input type="text"
          value={edit.planname}
          onChange={(e) => sededit({ ...edit, planname: e.target.value })}
          placeholder="Plan Name"
          required
        />

        <input type="text"
          value={edit.plantype}
          onChange={(e) => sededit({ ...edit, plantype: e.target.value })}
          placeholder="Plan Type"
          required
        />

        <input type="date"
          value={edit.startdate}
          onChange={(e) => sededit({ ...edit, startdate: e.target.value })}
          required
        />

        <input type="date"
          value={edit.enddate}
          onChange={(e) => sededit({ ...edit, enddate: e.target.value })}
          required
        />

        <div className="modal-buttons">
          <button type="submit" className="btn-primary">Update</button>
          <button type="button" className="btn-cancel" onClick={() => sededit(null)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
          {workdata && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Add Workdrill</h3>

      <form className='form-ele' onSubmit={workdrilladd}>
        <input
        className='form-ele'
          type="text"
          value={workdata.workname}
          onChange={(e) => setWorkdata({ ...workdata, workname: e.target.value })}
          placeholder="Work Name"
          required
        />

        <input
        className='form-ele'
          type="text"
          value={workdata.duration}
          onChange={(e) => setWorkdata({ ...workdata, duration: e.target.value })}
          placeholder="Duration"
          required
        />

        <select
        className='form-ele'
          value={workdata.intencity}
          onChange={(e) => setWorkdata({ ...workdata, intencity: e.target.value })}
          required
        >
          <option value="">Select Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <div className="modal-buttons">
          <button type="submit" className="btn-primary form-ele ">Add</button>
          <button type="button" className="btn-cancel form-ele" onClick={() => setWorkdata(null)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
</>
    )
}

export default Traningschedulescoach