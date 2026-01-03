import React, {  useEffect, useState } from 'react'
import NavbarOfAth from '../NavbarOfAth'
import axios from 'axios';
const ComplainCoach = ({user}) => {
 
const[complain,setComplain]=useState({

  comment:"",
  difficultlevel:""
});
   const fectdata = async (e) => {
    e.preventDefault();
        try {
            const data = await axios.post(`http://localhost:8056/viewDataFeedback/${user.athid}`,complain);
          alert('Feedback send');
            
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
   
  return (
    <>
    <NavbarOfAth/>
      <div className='d-flex justify-content-center align-items-center vh-100 bg-white'>
     <div className="container-fluid">
         <div className='row'>
   <div className='col-sm-4'/>
   <div className='col-sm-4 border p-3 shadow bg-light rounded'>
    <form onSubmit={fectdata}>
        <h2 className='text-center text-primary'>Feedback form</h2>
        {/* <input type="text" name='athid' value={complain.athid.athid} className='form-control my-2'/> */}
       {/* <input type="text" name="comment" placeholder='Enter Comment' value={complain.comment} onChange={(e)=>setComplain({...complain,comment:e.target.value})} className='form-control my-2'required /> */}
       <textarea type="text" name="comment" placeholder='Enter Comment' value={complain.comment} onChange={(e)=>setComplain({...complain,comment:e.target.value})} className='form-control my-2'required />
      <select name="difficultlevel" className='form-control my-2'  value={complain.difficultlevel} onChange={(e)=>setComplain({...complain,difficultlevel:e.target.value})}  required>
       <option value="">Select difficultlevel </option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
       </select>
         
        
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

export default ComplainCoach