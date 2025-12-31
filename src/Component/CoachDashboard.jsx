import React from 'react'
import {useNavigate} from 'react-router-dom'
import { useEffect,useState } from 'react';
import axios from 'axios';
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
    {data&&(
        <div className='vh-100 bg-primary mt-5'>CoachDashboard</div>
    )}
    </>
  )
}

export default CoachDashboard