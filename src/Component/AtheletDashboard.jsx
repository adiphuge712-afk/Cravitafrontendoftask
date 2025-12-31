import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import Logout from '../utils/Logout';
import NavbarOfAth from './NavbarOfAth';
const AtheletDashboard = () => {
    const [data,setShow]=useState(null);
    const navigate=useNavigate();

   const show=async()=>
   {
     try {
        const t=await axios.get("http://localhost:8056/checksession",{});
        // alert(t.data);
        // if(t.data===true){
        //     setShow(true);
        // }else{
        //     navigate('/login');
        // }
        setShow(true);
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
   {data&&( <>
   <NavbarOfAth/>
   <div className='vh-100 bg-danger  text-white '>
    <h2>Welcome</h2>
    <button type='button' className='btn btn-primary' onClick={()=>Logout(navigate)}>Logout</button>
    
    
     </div>

   </>

)}
  
  </>
  )
}

export default AtheletDashboard