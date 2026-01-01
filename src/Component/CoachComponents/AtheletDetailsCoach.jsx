import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState,useEffect } from 'react';
import axios from 'axios';
const AtheletDetailsCoach = ({user}) => {

  const [coachdat, setCoachData] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`http://localhost:8056/viewDataAthletCoach/${user.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    
    useEffect(() => {
        fectdata();
    }, []);

  return (

   <>
   <NavbarCoach/>
    <table className='table table-borderd border '>
               <thead className='table-dark'>
                 <tr className='border'>
                    <th>Sr.no</th>
                    <th>Athelet Id</th>
                    <th>Athelet Name</th>
                    <th>Age</th>
                    <th>Email</th>
                    <th>Sport Type</th>
                    {/* <th>Schedule Plan</th> */}
                    </tr>
               </thead>
               <tbody>
                  {coachdat.map((d,index)=>(
                    <tr key={d.athid}>
                      <td>{index+1}</td>
                      <td>{d.athid}</td>
                      <td>{d.name}</td>
                      <td>{d.age}</td>
                      <td>{d.email}</td>
                      <td>{d.sporttype}</td>
                      <td>
                         {/* <button className='btn btn-primary' onClick={() => Scheduleplan(d.coachid.coachid)}>Schedule Plan</button> */}
                      </td>
                    </tr>
                  ))}
               </tbody>
     </table>
   </>
  )
}

export default AtheletDetailsCoach