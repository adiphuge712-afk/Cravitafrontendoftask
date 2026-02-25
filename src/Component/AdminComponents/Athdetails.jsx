import React, { useEffect, useState } from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../AdminComponents/Athdetails.css';

const Athdetails = ({ user }) => {
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
  const [coachdata, setCoach] = useState(null);
  const caoch = async () => {
    try {
      const datas = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataCoach`);
      // alert('datafatch');
      setCoach(datas.data);
      console.log(datas.data);

    } catch (err) {
      console.log(err);
      alert('fail');

    }
  }
  const [assigend, setAssigend] = useState(null);
  const admindta = (d) => {
    setAssigend({
      athid: d.athid,
      coachid: {
        coachid: d.coachid?.coachid || ""
      }


    });

  }
  const [athdata, setAthdata] = useState([]);
  const fatchdata = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataAthlet`);
      setAthdata(res.data);
    } catch (error) {
      console.log(error);
      alert('fail to fetch data');
    }
  }
  const formsubit = async (e) => {
    e.preventDefault();
    try {
      const sub = await axios.post(`${import.meta.env.VITE_API_URL}/AssigendCoach`, assigend);
      fatchdata();
      alert(sub.data);
      setAssigend(null);


    } catch (error) {
      console.log(error);
      alert('fail');
    }
  }
  useEffect(() => {
    if(userdata){
      caoch();
    fatchdata();
    }
  }, [userdata]);
  if (!userdata) return <div>Loading...</div>;
  return (
    <>
  <Navbaradmin />

  <div className="admin-page">
    <div className="table-card">
      <h3 className="table-title">Athlete List</h3>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Sport</th>
              <th>Age</th>
              <th>Coach</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {athdata.map((d, index) => (
              <tr key={d.athid}>
                <td>{index + 1}</td>
                <td>{d.name}</td>
                <td>{d.email}</td>
                <td>{d.sporttype}</td>
                <td>{d.age}</td>
                <td>
                  {d.coachid === null
                    ? <span className="badge bg-warning">Not Assigned</span>
                    : d.coachid.coachid}
                </td>
                <td>
                  <button
                    className="assign-btn"
                    onClick={() => admindta(d)}
                  >
                    Assign Coach
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  {/* ================= MODAL ================= */}

  {assigend && (
    <div className="custom-modal">
      <div className="modal-card">
        <button
          className="close-btn"
          onClick={() => setAssigend(null)}
        >
          ✖
        </button>

        <h4 className="modal-title">Assign Coach</h4>

        <form onSubmit={formsubit}>
          <input
            type="hidden"
            value={assigend.athid}
            name="athid"
          />

          <select
            name="coachid"
            value={assigend.coachid?.coachid || ""}
            className="form-control"
            onChange={(e) =>
              setAssigend({
                ...assigend,
                coachid: { coachid: e.target.value },
              })
            }
            required
          >
            <option value="">Select Coach</option>
            {coachdata.map((c) => (
              <option key={c.coachid} value={c.coachid}>
                {c.name} - {c.specialization}
              </option>
            ))}
          </select>

          <button type="submit" className="submit-btn mt-3">
            Assign
          </button>
        </form>
      </div>
    </div>
  )}
</>
  )
}

export default Athdetails