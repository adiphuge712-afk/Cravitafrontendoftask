import React from 'react'
import './AtheletsAndWorkDrilsstyle.css';
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';

const AtheletsAndWorkdril = ({ user }) => {
    const [performance, setperformance] = useState(null);
    const [coachdat, setCoachData] = useState([]);
    const [workdril, setViewWorkdril] = useState([]);
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
    const fatchworkdirl = async () => {
        try {
            const work = await axios.get(`http://localhost:8056/viewDataWorkdril`);
            setViewWorkdril(work.data);


        } catch (error) {
            console.log(error);
            alert("Fail to fatech the workdril");
        }
    }
    const perpormance = (id, wid) => {
        // alert('ath id is  :'+id+'and wordk id is: '+wid);
        setperformance({
            "athid": id,
            "workid": wid,
            "performancematrix": "",
            "fatiquelevel": ""

        })
    }
    const formsubmitperformanse = async (e) => {
        e.preventDefault();
        try {
            // const data=await axios.post(`http://localhost:8056/addDataPerformancelog/${performance.athid}/${performance.workid}`,performance);
            axios.post(
                `http://localhost:8056/addDataPerformancelog/${performance.athid}/${performance.workid}`,
                {
                    performancematrix: performance.performancematrix,
                    fatiquelevel: performance.fatiquelevel
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            alert("Performance add");
            setperformance(null);
        } catch (error) {
            console.log(error);
            alert("Fail to add the performance");
        }
    }
    useEffect(() => {
        fectdata();
        fatchworkdirl();
    }, []);
    return (<>
        <NavbarCoach />
        <table className='table table-bordered border bg-dark '>
            <thead className='table-info border sticky-athlete'>
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
            <tbody className='bg-dark'>
                {coachdat.map((d, index) => (
                    <React.Fragment key={d.athid}>

                        {/* Athlete Row */}
                        <tr className="table-primary sticky-athlete-underhead-upertablework ">
                            <td>{index + 1}</td>
                            <td>{d.athid}</td>
                            <td>{d.name}</td>
                            <td>{d.age}</td>
                            <td>{d.email}</td>
                            <td>{d.sporttype}</td>
                        </tr>

                        {/* Workdril Row UNDER athlete */}
                        <tr>
                            <td colSpan="6">
                                <table className="table table-bordered">
                                    <thead className='table-danger sticky-athlete-underhead '>
                                        <tr>
                                            <th>WorkId</th>
                                            <th>WorkName</th>
                                            <th>Duration</th>
                                            <th>Intensity</th>
                                            <th>Plan Name</th>
                                            <th className='d-flex  justify-content-center '>Add performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='table-secondary bg-dark'>
                                        {workdril.map((w, index) => (
                                            <tr key={w.workid}>
                                                <td>{index + 1}</td>
                                                <td>{w.workname}</td>
                                                <td>{w.duration}</td>
                                                <td>{w.intencity}</td>
                                                
                                                <td>{w.plan.planname}</td>
                                                <td className='d-flex  justify-content-center '>
                                                    <button className=' btn btn-primary w-100' onClick={() => perpormance(d.athid, w.workid)}>Add</button>
                                                </td>
                                            </tr>

                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                    </React.Fragment>
                ))}
            </tbody>

        </table>
        {
            performance && (
                <div className='align-content-center position-fixed top-0 start-0 w-100 h-100 bg-dark  bg-opacity-75' style={{ zIndex: 1040 }}>

                    <div className="row mb-4">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-4 border shadow bg-light rounded p-3">
                            <form onSubmit={formsubmitperformanse}>

                                <h3 className='text-center'>Performance Add</h3>
                                <button className='btn btn-danger position-absolute top-0 end-0 m-2' onClick={() => {
                                    setperformance(null);
                                }} style={{ zIndex: 7750 }}>Close</button>

                                <select type="text" value={performance.performancematrix} onChange={(e) => setperformance({ ...performance, performancematrix: e.target.value })} name='performancematrix' className="form-control mt-2 p-2" required>
                                    <option value="">Select Performance</option>
                                    <option value="Low">Low</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="High">High</option>
                                    <option value="Excellent">Excellent</option>
                                </select>

                                <select type="text" value={performance.fatiquelevel} onChange={(e) => setperformance({ ...performance, fatiquelevel: e.target.value })} name="fatiquelevel" id='fatiquelevel' className="form-control mt-2 p-2" required>
                                    <option value="">Select Fatiquelevel</option>
                                    <option value="Fresh">Fresh</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="High">High</option>
                                    <option value="Excellent">Excellent</option>
                                </select>
                                <div className="d-flex justify-content-center my-2">
                                    <button type="submit" className='btn btn-success w-100'>Update</button>
                                </div>
                            </form>
                        </div>
                        <div className="col-sm-4"></div>
                    </div>
                </div>
            )
        }
    </>
    )
}

export default AtheletsAndWorkdril