import React, { useContext } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from './Context/UserContext';
import AdminDashboard from './AdminDashboard';
import AtheletDashboard from './AtheletDashboard';
import CoachDashboard from './CoachDashboard';
import FeedbackHistory from './AdminComponents/FeedbackHistory';

const Login = ({user}) => {
    
// console.log(user);
const{setcontext}=useContext(UserContext);
    const navigate = useNavigate();
    const [logdata, setDate] = useState({
        email: "",
        password: "",
        role: ""
    });
    const formsubmit = async (e) => {
        e.preventDefault();

        try {
          
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, logdata);
               setcontext(res.data);//sharethe data globle
            console.log(res.data);
            alert("Login success");
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
            alert('fail');
            navigate('/login');
        }
    }


    return (
        <>

            <div className=' d-flex justify-content-center align-items-center vh-100'>
                <div className="container">
                    <div className='row'>
                        <div className="col-sm-4"></div>
                        <div className="col-sm-4 rounded bg-light shadow p-3 border">
                            <h3 className='text-primary text-center'>Login Form</h3>
                            <form onSubmit={formsubmit}>
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input type="text" id='email' name="email" placeholder='enter email' required className='form-control mb-1' value={logdata.email} onChange={(e) => setDate({ ...logdata, email: e.target.value })} />
                                <label htmlFor="pass" className="form-label">Password:</label>
                                <input type="password" id='pass' name="password" placeholder='enter password' required className='form-control mb-1' onChange={(e) => setDate({ ...logdata, password: e.target.value })} value={logdata.password} />
                                <label htmlFor="role" className="form-label">Role:</label>
                                <select id='role' name="role" className="form-control mb-1" value={logdata.role} onChange={(e) => setDate({ ...logdata, role: e.target.value })} required>
                                    <option value="">Select the role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Coach">Coach</option>
                                    <option value="Athelet">Athelet</option>
                                </select>
                                <button className="btn btn-success w-100">Sign</button>
                            </form>
                        </div>
                        <div className="col-sm-4"></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login