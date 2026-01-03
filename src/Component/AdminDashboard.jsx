import React from 'react'
import {useNavigate} from 'react-router-dom'
import {useState,useEffect} from 'react'
import axios from 'axios';
import NavbarOfAth from './NavbarOfAth';
import Navbaradmin from "./AdminComponents/Navbaradmin";
;
const AdminDashboard = ({user}) => {
//      const [data,setShow]=useState(null);
//     const navigate=useNavigate();
    
// //    const show=async()=>
// //    {
// //      try {
// //         const t=await axios.get("http://localhost:8056/checksessionadmin",{});
// //         setShow(true);
// //     } catch (error) {
// //         console.log(error);
// //         navigate('/login');
// //     }
// //    }
//    useEffect(async()=>{
//  try {
//         const t=await axios.get("http://localhost:8056/checksessionadmin",{});
//         setShow(true);
//     } catch (error) {
//         console.log(error);
//         navigate('/login');
//     }
//    },[])
  return (
    <>
   <Navbaradmin/>
  
   <div className='vh-100 bg-info'>
     {/* <h2>Welcome {user.name}</h2> */}
    </div>
    </>
  )
}

export default AdminDashboard