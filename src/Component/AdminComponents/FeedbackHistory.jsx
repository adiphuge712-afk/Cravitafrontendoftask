import React from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';
import { useState,useEffect } from 'react';
const FeedbackHistory = ({user}) => {
  const [coachdat, setCoachData] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get('http://localhost:8056/viewDataFeedback');
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
    <Navbaradmin/>
    
    <table className='table table-borderd border '>
               <thead>
                 <tr className='border'>
                    <th>FeedBackId</th>
                    <th>Comment</th>
                    <th>DificultLevel</th>
                    <th>CoachId</th>
                    <th>Coach Name</th>
                    <th>AtheletId</th>
                    <th>Athelet Name</th>
                    </tr>
               </thead>
               <tbody>
                {coachdat.map((d,index)=>(
                  <tr key={d.feedid}>
                    <td>{index+1}</td>
                    <td>{d.comment}</td>
                    <td>{d.difficultlevel}</td>
                     <td>{d.athid.coachid.coachid}</td>
                     <td>{d.athid.coachid.name}</td>
                    <td>{d.athid.athid}</td>
                    <td>{d.athid.name}</td>
                  </tr>
                ))}
               </tbody>
      </table>
    </>
  )
}

export default FeedbackHistory