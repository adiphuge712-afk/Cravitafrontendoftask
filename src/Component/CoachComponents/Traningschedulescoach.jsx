import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const Traningschedulescoach = ({ user }) => {
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
    const [edit, sededit] = useState(null);
    const [workdata, setWorkdata] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail to fatech or loding');

        }
    }
    const deletestudent = async (id) => {
        // alert("id is "+id);
        if (window.confirm('Are your Sure???')) {
            try {
                const del = await axios.delete(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${id}`,{ withCredentials: true });
                if (del.data) {
                    // alert('deleted data');
                    fectdata();

                }
            } catch (error) {
                console.log(error);
                alert("Data not deleted");
            }
        }
    }
    const profileedit = async (d) => {
        sededit(d);
    }
    const formedit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/viewDataTraningplan/${edit.planid}`, edit);
            alert('Data is Updated');
            sededit(null);
            fectdata();
        } catch (error) {
            console.log(error);
            alert('Data not updated!!!!!!');
        }
    }
    const Workdriladd = async (id) => {
        // alert('plain id is '+id);
        sededit(null);
        setWorkdata({
            "planid": id,
            "workname": "",
            "intencity": "",
            "duration": ""
        })

    }
    const workdrilladd = async (e) => {
        e.preventDefault();
        try {
            const del = await axios.post(`${import.meta.env.VITE_API_URL}/addwork/${workdata.planid}`, workdata);
            if (del.data) {
                alert('DRIL IS ADD');
                setWorkdata(null);

            }
        } catch (error) {
            console.log(error);
            alert("Data not deleted");
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
            {/* <h1 className='text-center'>Welcome {user.name}</h1> */}
            <table className='table table-bordered border '>
                <thead className='table-danger'>
                    <tr className='border'>
                        <th>Sr.no</th>
                        <th>Planname</th>
                        <th>Plan Type</th>
                        <th>StartDate</th>
                        <th>EndDate</th>
                        <th className='text-center'>Modifiy</th>
                        <th>Workdril</th>
                    </tr>
                </thead>
                <tbody className='table-primary'>
                    {coachdat.map((d, index) => (
                        <tr key={d.planid}>
                            <td>{index + 1}</td>
                            <td>{d.planname}</td>
                            <td>{d.plantype}</td>
                            <td>{d.startdate}</td>
                            <td>{d.enddate}</td>
                            <td className='d-flex align-content-center justify-content-center'>
                                <button className='btn btn-danger mx-2 ' onClick={() => deletestudent(d.planid)}>Delete</button>
                                <button className='btn btn-info mx-2' onClick={() => profileedit(d)}>Plan edit</button>
                            </td>
                            <td>
                                <button className='btn btn-success w-100' onClick={() => Workdriladd(d.planid)} >Workdril</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {
                edit && (
                    <div className='align-content-center position-fixed top-0 start-0 w-100 h-100 bg-dark  bg-opacity-75' style={{ zIndex: 1040 }}>

                        <div className="row mb-4">
                            <div className="col-sm-4"></div>
                            <div className="col-sm-4 border shadow bg-light rounded p-3">
                                <form onSubmit={formedit}>

                                    <h3 className='text-center'>Plan Edit</h3>
                                    <button className='btn btn-danger position-absolute top-0 end-0 m-2' onClick={() => {
                                        sededit(null)
                                    }} style={{ zIndex: 7750 }}>Close</button>
                                    <input type="hidden" value={edit.planid} onChange={(e) => sededit({ ...edit, planid: e.target.value })} name='planid' className="form-control mt-2 p-2" required />
                                    <input type="text" value={edit.planname} onChange={(e) => sededit({ ...edit, planname: e.target.value })} name='planname' id='planname' className="form-control mt-2 p-2" placeholder='Enter the Name' required />
                                    <input type="text" value={edit.plantype} onChange={(e) => sededit({ ...edit, plantype: e.target.value })} name="plantype" id='plantype' className="form-control mt-2 p-2" placeholder='Enter the Email' required />
                                    <input type="date" value={edit.startdate} onChange={(e) => sededit({ ...edit, startdate: e.target.value })} name='startdate' id='startdate' className="form-control mt-2 p-2" placeholder='Enter the Password' required />
                                    <input type="date" value={edit.enddate} onChange={(e) => sededit({ ...edit, enddate: e.target.value })} name='enddate' id='enddate' className="form-control mt-2 p-2" placeholder='Enter the Experience' required />

                                    <div className="d-flex justify-content-center my-2">
                                        <button type="submit" className='btn btn-primary'>Update</button>
                                    </div>
                                </form>
                            </div>
                            <div className="col-sm-4"></div>
                        </div>
                    </div>
                )
            }
            {workdata && (
                <div className='align-content-center position-fixed top-0 start-0 w-100 h-100 bg-dark  bg-opacity-75' style={{ zIndex: 1040 }}>

                    <div className="row mb-4">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-4 border shadow bg-light rounded p-3">
                            <form onSubmit={workdrilladd}>

                                <h3 className='text-center'>Workdril Add</h3>
                                <button className='btn btn-danger position-absolute top-0 end-0 m-2' onClick={() => {
                                    setWorkdata(null);
                                }} style={{ zIndex: 7750 }}>Close</button>

                                <input type="text" value={workdata.workname} onChange={(e) => setWorkdata({ ...workdata, workname: e.target.value })} name='workname' id='workname' className="form-control mt-2 p-2" placeholder='Enter the Name' required />
                                <input type="text" value={workdata.duration} onChange={(e) => setWorkdata({ ...workdata, duration: e.target.value })} name="duration" id='duration' className="form-control mt-2 p-2" placeholder='Enter the duration' required />
                                <select name="intencity" type="text" value={workdata.intencity} onChange={(e) => setWorkdata({ ...workdata, intencity: e.target.value })} className="form-control mt-2 p-2" placeholder='Select the intencity' required >
                                    <option value="">Select the intencity</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                                <div className="d-flex justify-content-center my-2">
                                    <button type="submit" className='btn btn-primary'>AddWork</button>
                                </div>
                            </form>
                        </div>
                        <div className="col-sm-4"></div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Traningschedulescoach