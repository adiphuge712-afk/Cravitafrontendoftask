import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import Logout from '../utils/Logout';
import NavbarOfAth from './NavbarOfAth';
import './AtheletDashboard.css';
const AtheletDashboard = ({user}) => {
    // const [data,setShow]=useState(null);
    // const navigate=useNavigate();

//    const show=async()=>
//    {
//      try {
//         const t=await axios.get(`${import.meta.env.VITE_API_URL}/checksession`,{});
//         // alert(t.data);
//         // if(t.data===true){
//         //     setShow(true);
//         // }else{
//         //     navigate('/login');
//         // }
//         // setShow(true);
//     } catch (error) {
//         console.log(error);
//         navigate('/login');
//     }
//    }
//    useEffect(()=>{
// show()
//    },[])
  return (
  <>
  <div className='navstiky'>
    <NavbarOfAth/>
  </div>
   
   <div className='dashboardheight bg-secondary  text-white '>
    <h2 className='text-primary'>Welcome <span className='text-info'>{user.name}</span></h2>
    
     </div>

   
  
  </>
  )
}

export default AtheletDashboard