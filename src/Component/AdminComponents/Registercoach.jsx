import React, { useState ,useEffect} from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../AdminComponents/Registercoach.css'

const Registercoach = ({ user }) => {
  const [isLoding, setLoding] = useState(false);
   const [userdata,setuserdata]=useState(null);
    useEffect(()=>{
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        // console.log("Decoded data is : ",decoded.user);
         setuserdata(decoded.user|| decoded);
      }else{
         window.location.href = "/login";
      }
     },[]);
    const [formdata, setData] = useState({
        name: "",
        email: "",
        age: "",
        password: "",
        experience: "",
        specialization: "",
        adminid: ""
    });
    const nav = useNavigate();
    const formsubmit = async (e) => {
        e?.preventDefault();
        // console.log(formdata);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/registercoach/${userdata.adminid}`, formdata);
            if (res) {
                alert('Register Complete');
                nav('/Coachinfo');

            }
        } catch (er) {
            console.log(er);
            alert('fail');

        }
        finally {
      setLoding(false);
    }
    }
    if (!userdata) return <div>Loading...</div>;
    return (
       <>
  <Navbaradmin />

  <div className="register-page">
    <div className="register-card">
      <h2 className="register-title">Register Coach</h2>

      <form onSubmit={formsubmit}>

        <div className="form-group">
          <label>Coach Name</label>
          <input
            type="text"
            value={formdata.name}
            onChange={(e) => setData({ ...formdata, name: e.target.value })}
            className="form-control"
            placeholder="Enter Coach Name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formdata.email}
            onChange={(e) => setData({ ...formdata, email: e.target.value })}
            className="form-control"
            placeholder="Enter Email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formdata.password}
            onChange={(e) => setData({ ...formdata, password: e.target.value })}
            className="form-control"
            placeholder="Enter Password"
            required
          />
        </div>

        <div className="form-group">
          <label>Experience</label>
          <input
            type="text"
            value={formdata.experience}
            onChange={(e) => setData({ ...formdata, experience: e.target.value })}
            className="form-control"
            placeholder="Years of Experience"
            required
          />
        </div>

        <div className="form-group">
          <label>Specialization</label>
          <select
            className="form-control"
            value={formdata.specialization}
            onChange={(e) => setData({ ...formdata, specialization: e.target.value })}
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
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={formdata.age}
            onChange={(e) => setData({ ...formdata, age: e.target.value })}
            className="form-control"
            placeholder="Enter Age"
            min="18"
            required
          />
        </div>

        <button type="submit" className="submit-btn"  disabled={isLoding}>
           {isLoding ? "Processing..." : "Register"}
        </button>

      </form>
    </div>
  </div>
</>
    )
}

export default Registercoach