import React from 'react'
import {useNavigate} from 'react-router-dom'
import { useEffect,useState } from 'react';
import axios from 'axios';
import NavbarCoach from './CoachComponents/NavbarCoach';
import { jwtDecode } from 'jwt-decode';
const CoachDashboard = () => {
   const [userdata, setuserdata] = useState(null);
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded data is : ",decoded.user);
        setuserdata(decoded.user || decoded);
      } else {
        window.location.href = "/login";
      }
    }, []);
 const [data,setShow]=useState(null);
    const navigate=useNavigate();

   const show=async()=>
   {
     try {
        const t=await axios.get(`${import.meta.env.VITE_API_URL}/checksession`,data);
        if(t.data!=null){
            setShow(true);
        }else{
            navigate('/login');
        }
    } catch (error) {
        console.log(error);
        navigate('/login');
    }
   }
   useEffect(()=>{
show()
   },[])
if (!userdata) return <div>Loading...</div>;
  return (
    <>
        <NavbarCoach/>
        <div className='vh-100 bg-secondary'>CoachDashboard</div>
    
    </>
  )
}

export default CoachDashboard