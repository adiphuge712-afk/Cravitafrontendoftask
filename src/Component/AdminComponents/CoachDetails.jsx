import React, { useEffect, useState } from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../AdminComponents/CoachDetails.css'

const CoachDetails = ({ user }) => {
   const [userdata,setuserdata]=useState(null);
     useEffect(()=>{
       const token = localStorage.getItem("token");
       if (token) {
         const decoded = jwtDecode(token);
        //  console.log("Decoded data is : ",decoded.user);
          setuserdata(decoded.user|| decoded);
       }else{
          window.location.href = "/login";
       }
      },[]);
    const [coachdat, setCoachData] = useState([]);
    const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataCoach`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    useEffect(() => {
        fectdata();
    }, []);//only run when data get change  and run for ones
    const deletestudent = async (id) => {
        // alert("id is "+id);
        if (window.confirm('Are your Sure???')) {
            try {
                const del = await axios.delete(`${import.meta.env.VITE_API_URL}/viewDataCoach/${id}`);
                if (del.data) {
                    alert('deleted data');
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
            await axios.put(`${import.meta.env.VITE_API_URL}/viewDataCoach/${edit.coachid}`, edit);
            alert('Data is Updated');
            sededit(null);
            fectdata();
        } catch (error) {
            console.log(error);
            alert('Data not updated!!!!!!');
        }
    }
    if (!userdata) return <div>Loading...</div>;
    return (
       <>
  <Navbaradmin />

  <div className="admin-page">
    <div className="table-card">
      <h3 className="table-title">Coach Management</h3>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Admin</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {coachdat.map((d, index) => (
              <tr key={d.coachid}>
                <td>{index + 1}</td>
                <td>{d.name}</td>
                <td>{d.email}</td>
                <td>{d.age}</td>
                <td>
                  <span className="badge bg-primary">
                    {d.specialization}
                  </span>
                </td>
                <td>{d.experience}</td>
                <td>
                  {d.adid?.adminid} - {d.adid?.name}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deletestudent(d.coachid)}
                  >
                    Delete
                  </button>

                  <button
                    className="edit-btn"
                    onClick={() => profileedit(d)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  {/* ================= EDIT MODAL ================= */}

  {edit && (
    <div className="custom-modal">
      <div className="modal-card">
        <button
          className="close-btn"
          onClick={() => sededit(null)}
        >
          ✖
        </button>

        <h4 className="modal-title">Update Coach Profile</h4>

        <form onSubmit={formedit}>

          <input type="hidden" value={edit.coachid} />

          <input
            type="text"
            value={edit.name}
            onChange={(e) => sededit({ ...edit, name: e.target.value })}
            className="form-control"
            placeholder="Coach Name"
            required
          />

          <input
            type="email"
            value={edit.email}
            onChange={(e) => sededit({ ...edit, email: e.target.value })}
            className="form-control"
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={edit.password}
            onChange={(e) => sededit({ ...edit, password: e.target.value })}
            className="form-control"
            placeholder="Password"
            required
          />

          <input
            type="text"
            value={edit.experience}
            onChange={(e) => sededit({ ...edit, experience: e.target.value })}
            className="form-control"
            placeholder="Experience"
            required
          />

          <select
            value={edit.specialization}
            onChange={(e) =>
              sededit({ ...edit, specialization: e.target.value })
            }
            className="form-control"
            required
          >
            <option value="">Select Sport</option>
            <option value="Cricket">Cricket</option>
            <option value="Kho-Kho">Kho-Kho</option>
            <option value="Carrom">Carrom</option>
            <option value="Chess">Chess</option>
            <option value="Mallakhamb">Mallakhamb</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Football">Football</option>
          </select>

          <input
            type="number"
            value={edit.age}
            onChange={(e) =>
              sededit({ ...edit, age: e.target.value })
            }
            className="form-control"
            placeholder="Age"
            required
          />

          <button type="submit" className="update-btn">
            Update Coach
          </button>

        </form>
      </div>
    </div>
  )}
</>
    )
}

export default CoachDetails