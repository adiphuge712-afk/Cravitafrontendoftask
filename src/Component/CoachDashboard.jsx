import React from 'react'
import {useNavigate} from 'react-router-dom'
import { useEffect,useState } from 'react';
import axios from 'axios';
import NavbarCoach from './CoachComponents/NavbarCoach';
const CoachDashboard = () => {
 const [data,setShow]=useState(null);
    const navigate=useNavigate();

   const show=async()=>
   {
     try {
        const t=await axios.get("http://localhost:8056/checksession",data);
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

  return (
    <>
        <NavbarCoach/>
        <div className='vh-100 bg-primary'>CoachDashboard</div>
    
    </>
  )
}

export default CoachDashboard