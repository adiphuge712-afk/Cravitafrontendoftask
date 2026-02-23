import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const Perfromancelog = ({ user }) => {
  const [userdata, setuserdata] = useState(null);
      useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          // console.log("Decoded data is : ",decoded.user);
          setuserdata(decoded.user || decoded);
        } else {
          window.location.href = "/login";
        }
      }, []);
    const [coachdat, setCoachData] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataPerformancelog/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }

    useEffect(() => {
        if(userdata){
            fectdata();
        }
    }, [userdata]);
if (!userdata) return <div>Loading...</div>;
    return (
        <>
            <NavbarCoach />
            <table className='table table-bordered border '>
                <thead className='table-danger'>
                    <tr className='border'>
                        <th>Log Id</th>
                        <th>Date</th>
                        <th>Fatiquelevel</th>
                        <th>Performancematrix</th>
                        <th>Coach Name</th>
                        <th>AtheletId</th>
                        <th>Athelet Name</th>
                        <th>Athelet Email</th>
                        <th>Workname</th>
                    </tr>
                </thead>
                <tbody className='table-info'>
                    {coachdat.map((d, index) => (
                        <tr key={d.logid}>
                            <td>{index + 1}</td>
                            <td>{d.date}</td>
                            <td>{d.fatiquelevel}</td>
                            <td>{d.performancematrix}</td>
                            <td>{d.athid.coachid.name}</td>
                            <td>{d.athid.athid}</td>
                            <td>{d.athid.name}</td>
                            <td>{d.athid.email}</td>
                            <td>{d.workid.workname}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default Perfromancelog