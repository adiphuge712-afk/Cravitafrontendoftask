import React from 'react'
import NavbarCoach from './NavbarCoach'
import axios from 'axios';
import { useState,} from 'react';
import { useNavigate } from 'react-router-dom';
const Scheduleplan = ({user}) => {
 const [reg,setRegister]=useState({
        planname:"",
        plantype:"",
        startdate:"",
        enddate:""
    });
    const navigate=useNavigate();
    const formsubmit=async(e)=>{
        e.preventDefault();

        try {
            await axios.post(`http://localhost:8056/addPlan/${user.coachid}`,reg);
            alert("Plan Add");
            setRegister({
                     planname:"",
                     plantype:"",
                     startdate:"",
                     enddate:""
            });
            navigate("/Traningplans");

        } catch (error) {
            console.log(error);
            alert('fail');
        }
    }
    

  return (
    <>
    <NavbarCoach/>
    {/* <h1 className='text-center'>Welcome {user.name}</h1> */}
         <div className='d-flex justify-content-center align-items-center vh-100 bg-secondary'>
     <div className="container">
         <div className='row'>
   <div className='col-sm-4'/>
   <div className='col-sm-4 border p-3 shadow bg-light rounded'>
    <form onSubmit={formsubmit}>
        <h2 className='text-center text-primary'>SchdulePlan form</h2>
        <label htmlFor="planname" className='form-label'>Plan Name:</label>
       <input type="text" id="planame"name="planname" placeholder='Enter planname' className='form-control my-2' value={reg.planname} onChange={(e)=>setRegister({...reg,planname:e.target.value})}required />
       <label htmlFor="plantype" className='form-label'>Plan Type:</label>
       <input type="text" id="plantype" name="plantype" placeholder='Enter type' className='form-control my-2' value={reg.plantype} onChange={(e)=>setRegister({...reg,plantype:e.target.value})} required />
       <label className='form-label' htmlFor="startdate">Startdate:</label>
       <input type="date" id="startdate" name="startdate" placeholder='Enter satrtdate' className='form-control my-2' value={reg.startdate} onChange={(e)=>setRegister({...reg,startdate:e.target.value})} required/>
       <label className='form-label' htmlFor="enddate">EndDate:</label>
       <input type="date" id='enddate' name="enddate" className="form-control my-2" placeholder='Enter your enddate' value={reg.enddate} onChange={(e)=>setRegister({...reg,enddate:e.target.value})} required />
     
       <button className='btn btn-success w-100' type='submit'>Submit</button>
    </form>
   </div>
   <div className='col-sm-4'/>
   </div>
    </div>
   </div>
    </>
  )
}

export default Scheduleplan