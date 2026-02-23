import React, { useState ,useEffect} from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Registercoach = ({ user }) => {
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
    }
    if (!userdata) return <div>Loading...</div>;
    return (
        <> <Navbaradmin />
            <div className="container-fluid  ">
                <div className="row">

                    <div className="col-sm-3"></div>
                    <div className="col-sm-6 border bg-light shadow p-3 rounded ">
                        <form onSubmit={formsubmit}>
                            <h3 className='text-center'>Register Coach</h3>

                            <label htmlFor="name">CoachName:</label>
                            <input type="text" value={formdata.name} onChange={(e) => setData({ ...formdata, name: e.target.value })} name='name' id='name' className="form-control mt-2 p-2" placeholder='Enter the Name' required />
                            <label htmlFor="email">Email:</label>
                            <input type="email" value={formdata.email} onChange={(e) => setData({ ...formdata, email: e.target.value })} name="email" id='email' className="form-control mt-2 p-2" placeholder='Enter the Email' required />
                            <label htmlFor="pass">Password:</label>
                            <input type="password" value={formdata.password} onChange={(e) => setData({ ...formdata, password: e.target.value })} name='password' id='pass' className="form-control mt-2 p-2" placeholder='Enter the Password' required />
                            <label htmlFor="Exp">Experience:</label>
                            <input type="text" value={formdata.experience} onChange={(e) => setData({ ...formdata, experience: e.target.value })} name='experience' id='Exp' className="form-control mt-2 p-2" placeholder='Enter the Experience' required />
                            {/* <label htmlFor="specialization">Specialization:</label>
                        <input type="text"  value={formdata.specialization}  onChange={(e)=>setData({...formdata,specialization:e.target.value})} name='specialization' id='specialization' className="form-control mt-2 p-2" placeholder='Enter the Specializetion' required />
                         */}
                            <label htmlFor="specialization">Specialization:</label>
                            <select name="specialization" id='specialization' className='form-control my-2' value={formdata.specialization} onChange={(e) => setData({ ...formdata, specialization: e.target.value })} required>
                                <option value="">Select the sport type</option>
                                <option value="Cricket">Cricket</option>
                                <option value="Khokho">Kho-Kho</option>
                                <option value="Caroom">Caroom</option>
                                <option value="Chesh">Chesh</option>
                                <option value="Mallakham">Mallakham</option>
                                <option value="Hollyboll">Hollyboll</option>
                                <option value="Footboll">Footboll</option>
                            </select>


                            <label htmlFor="age">Age:</label>
                            <input type="text" value={formdata.age} onChange={(e) => setData({ ...formdata, age: e.target.value })} name='age' id='age' className="form-control mt-2 p-2" placeholder='Enter the Age' required />
                            <button className='btn btn-success w-100 my-2'>Submit</button>
                        </form>
                    </div>
                    <div className="col-sm-3"></div>
                </div>
            </div>
        </>
    )
}

export default Registercoach