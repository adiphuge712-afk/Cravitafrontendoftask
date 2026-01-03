import React from 'react'
import { useState } from 'react'
import { useNavigate} from 'react-router-dom'
import axios from 'axios'
const Register = () => {
    const [reg,setRegister]=useState({
         name:"",
    email:"",
    password:"",
    age:"",
    sporttype:""
    });
    const navigate=useNavigate();
    const formsubmit=async(e)=>{
        e.preventDefault();

        try {
            await axios.post('http://localhost:8056/registerathlet',reg);
            alert("Register Complete");
            setRegister({
                   name:"",
    email:"",
    password:"",
    age:"",
    sporttype:""
            });
            navigate("/login");

        } catch (error) {
            console.log(error);
            alert('fail');
        }
    }
    
    
  return (
    <>
   <div className='d-flex justify-content-center align-items-center vh-100 bg-white'>
     <div className="container">
         <div className='row'>
   <div className='col-sm-4'/>
   <div className='col-sm-4 border p-3 shadow bg-light rounded'>
    <form >
        <h2 className='text-center text-primary'>Registration form</h2>
       <input type="text" name="name" placeholder='Enter name' className='form-control my-2' value={reg.name} onChange={(e)=>setRegister({...reg,name:e.target.value})}required />
       <input type="email" name="email" placeholder='Enter email ***@gmail.com' className='form-control my-2' value={reg.email} onChange={(e)=>setRegister({...reg,email:e.target.value})} required />
       <input type="password" name="password" placeholder='Enter Password' className='form-control my-2' value={reg.password} onChange={(e)=>setRegister({...reg,password:e.target.value})} required/>
       <input type="text" name="age" className="form-control my-2" placeholder='Enter your Age' value={reg.age} onChange={(e)=>setRegister({...reg,age:e.target.value})} required />
       <select name="sporttype" className='form-control my-2' value={reg.sporttype} onChange={(e)=>setRegister({...reg,sporttype:e.target.value})}required>
       <option value="">Select the sport type</option>
        <option value="Cricket">Cricket</option>
        <option value="Khokho">Kho-Kho</option>
        <option value="Caroom">Caroom</option>
        <option value="Chesh">Chesh</option>
        <option value="Mallakham">Mallakham</option>
        <option value="Hollyboll">Hollyboll</option>
        <option value="Footboll">Footboll</option>
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

export default Register