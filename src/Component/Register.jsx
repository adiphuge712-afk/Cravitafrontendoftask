import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Register.css';
const Register = () => {
    const [reg, setRegister] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        sporttype: ""
    });
    const navigate = useNavigate();
    const formsubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/registerathlet`, reg);
            alert("Register Complete");
            setRegister({
                name: "",
                email: "",
                password: "",
                age: "",
                sporttype: ""
            });
            navigate("/login");

        } catch (error) {
            console.log(error);
            alert('fail');
        }
    }


    return (
       <>
  <div className="register-page">
    <div className="register-card">
      <h2 className="register-title">Create Account</h2>

      <form onSubmit={formsubmit}>

        <div className="register-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={reg.name}
            onChange={(e) =>
              setRegister({ ...reg, name: e.target.value })
            }
            required
          />
        </div>

        <div className="register-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={reg.email}
            onChange={(e) =>
              setRegister({ ...reg, email: e.target.value })
            }
            required
          />
        </div>

        <div className="register-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={reg.password}
            onChange={(e) =>
              setRegister({ ...reg, password: e.target.value })
            }
            required
          />
        </div>

        <div className="register-group">
          <label>Age</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={reg.age}
            onChange={(e) =>
              setRegister({ ...reg, age: e.target.value })
            }
            required
          />
        </div>

        <div className="register-group">
          <label>Sport Type</label>
          <select
            value={reg.sporttype}
            onChange={(e) =>
              setRegister({ ...reg, sporttype: e.target.value })
            }
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

        <button type="submit" className="register-btn">
          Register
        </button>

      </form>
    </div>
  </div>
</>
    )
}

export default Register