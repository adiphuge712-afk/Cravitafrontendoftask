import React from 'react'
import './AtheletsAndWorkdrilsstyle.css';
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../CoachComponents/AtheletsAndWorkdirl.css';
const AtheletsAndWorkdril = ({ user }) => {
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
    const [loading, setLoading] = useState(false);      // page loading
    const [submitting, setSubmitting] = useState(false); // form loading
    const [performance, setperformance] = useState(null);
    const [coachdat, setCoachData] = useState([]);
    const [workdril, setViewWorkdril] = useState([]);
    const fectdata = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataAthletCoach/${userdata.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    const fatchworkdirl = async () => {
        try {
            const work = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataWorkdrilByCoachid/${userdata.coachid}`);
            setViewWorkdril(work.data);


        } catch (error) {
            console.log(error);
            alert("Fail to fatech the workdril");
        }
    }
    const [performancelogs, setPerformanceLogs] = useState([]);
    const fetchPerformanceLogs = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/viewDataPerformancelog/${userdata.coachid}`
            );
            // console.log("performacedata is: ",res.data);
            setPerformanceLogs(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    const checkPerformanceExists = (athid, workid) => {
        // console.log("athis id and wokid is ",athid,workid);
        return performancelogs.some(
            (p) => p.athid?.athid === athid && p.workid?.workid === workid
        );
    };

    const perpormance = (id, wid) => {
        // alert('ath id is  :'+id+'and wordk id is: '+wid);
        setperformance({
            "athid": id,
            "workid": wid,
            "performancematrix": "",
            "fatiquelevel": "",
            "completestatus": ""

        })
    }
    const formsubmitperformanse = async (e) => {
        e.preventDefault();

        const exists = checkPerformanceExists(
            performance.athid,
            performance.workid
        );
        // await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            setSubmitting(true);
            if (exists) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/updatePerformancelog/${performance.athid}/${performance.workid}`,
                    {
                        completestatus: performance.completestatus,
                        performancematrix: performance.performancematrix,
                        fatiquelevel: performance.fatiquelevel
                    }
                );
                alert("Performance Updated");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/addDataPerformancelog/${performance.athid}/${performance.workid}`,
                    {
                        completestatus: performance.completestatus,
                        performancematrix: performance.performancematrix,
                        fatiquelevel: performance.fatiquelevel
                    }
                );
                alert("Performance Added");
            }

            setperformance(null);
            await fetchPerformanceLogs(); // refresh UI
        } catch (error) {
            console.log(error);
            alert("Operation Failed");
        }
        finally {
            setSubmitting(false);
        }
    };
    useEffect(() => {
        const loadData = async () => {
            if (userdata) {
                setLoading(true);
                await fectdata();
                await fatchworkdirl();
                await fetchPerformanceLogs();
                setLoading(false);
            }
        };

        loadData();
    }, [userdata]);
    if (!userdata) return <div>Loading...</div>;
   if (loading) {
    return (
        <>
            <NavbarCoach />
            <div className="loading-screen">
                <h2>Loading Data...</h2>
            </div>
        </>
    );
}
    return (<>
        <NavbarCoach />

        <div className="coach-page">
            <h2 className="page-title">Athlete Work Management</h2>

            <div className="main-table-wrapper">
                <table className="main-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Athlete ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Email</th>
                            <th>Sport</th>
                        </tr>
                    </thead>

                    <tbody>
                        {coachdat.map((d, index) => (
                            <React.Fragment key={d.athid}>

                                {/* Athlete Row */}
                                <tr className="athlete-row">
                                    <td>{index + 1}</td>
                                    <td>{d.athid}</td>
                                    <td>{d.name}</td>
                                    <td>{d.age}</td>
                                    <td>{d.email}</td>
                                    <td>
                                        <span className="sport-badge">{d.sporttype}</span>
                                    </td>
                                </tr>

                                {/* Workdrill Section */}
                                <tr>
                                    <td colSpan="6">
                                        <div className="nested-wrapper">
                                            <table className="nested-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Workout</th>
                                                        <th>Duration</th>
                                                        <th>Intensity</th>
                                                        <th>Plan</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {workdril.map((w, i) => (
                                                        <tr key={w.workid}>
                                                            <td>{i + 1}</td>
                                                            <td>{w.workname}</td>
                                                            <td>{w.duration} Min</td>
                                                            <td>
                                                                <span className="intensity-badge">
                                                                    {w.intencity}
                                                                </span>
                                                            </td>
                                                            <td>{w.plan.planname}</td>
                                                            <td>
                                                                <button
                                                                    className="action-btn"
                                                                    onClick={() =>
                                                                        perpormance(d.athid, w.workid)
                                                                    }
                                                                >
                                                                    {checkPerformanceExists(d.athid, w.workid)
                                                                        ? "Update Performance"
                                                                        : "Add Performance"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Performance Modal */}
        {performance && (
            <div className="modal-overlay">
                <div className="modal-box">
                    <button
                        className="btn-cancel modal-box-ele"
                        onClick={() => setperformance(null)}
                    >
                        ✕
                    </button>

                    <h3 className='modal-box-ele'>Add Performance</h3>

                    <form onSubmit={formsubmitperformanse}>
                        <select
                            className='modal-box-ele'
                            value={performance.performancematrix}
                            onChange={(e) =>
                                setperformance({
                                    ...performance,
                                    performancematrix: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select Performance</option>
                            <option value="Low">Low</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="High">High</option>
                            <option value="Excellent">Excellent</option>
                        </select>

                        <select
                            className='modal-box-ele'
                            value={performance.fatiquelevel}
                            onChange={(e) =>
                                setperformance({
                                    ...performance,
                                    fatiquelevel: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select Fatigue</option>
                            <option value="Fresh">Fresh</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="High">High</option>
                            <option value="Extreme">Extreme</option>
                        </select>
                        <select
                            className='modal-box-ele'
                            value={performance.completestatus || ""}
                            onChange={(e) =>
                                setperformance({
                                    ...performance,
                                    completestatus: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Not Completed">Not Completed</option>
                        </select>

                        <button type="submit" className="submit-btn modal-box-ele" disabled={submitting}>
                            {submitting ? "Processing..." : "Update"}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </>
    )
}

export default AtheletsAndWorkdril