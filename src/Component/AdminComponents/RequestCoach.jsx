import React from 'react'
import Navbaradmin from './Navbaradmin'
import '../AdminComponents/RequestCoach.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useState, useEffect } from 'react';
const RequestCoach = () => {
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

    const [requestdata, setFectdat] = useState([]);
    const fechdata = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/viewrequestbyAdminid/${userdata.adminid}`);
            // console.log("request dat is :", res.data);
            setFectdat(res.data);
            // alert("fatch data");
        } catch (error) {
            console.log("request dat is error :", error);
            alert("Data not found!!!!!!!");
        }
    }
    const [coachdata, setCoach] = useState(null);
    const caoch = async () => {
        try {
            const datas = await axios.get(`${import.meta.env.VITE_API_URL}/viewDataCoach`);
            // alert('datafatch');
            setCoach(datas.data);
            console.log(datas.data);

        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    const [assigend, setAssigend] = useState(null);
    const Atheletdata = async (d) => {
        // alert("athelet id is "+d.athid.athid);
        setAssigend({
            athid: d.athid.athid,
            coachid: {
                coachid: d.coachid?.coachid || ""
            }


        });
    }
    const [Loding, setLoding] = useState(false);
    const formsubit = async (e) => {
        e.preventDefault();
        setLoding(true);
        // await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const sub = await axios.post(`${import.meta.env.VITE_API_URL}/AssigendCoach`, assigend);
            fechdata();
            //   alert(sub.data);
            setAssigend(null);


        } catch (error) {
            console.log(error);
            alert('fail');
        } finally {
            setLoding(false);
        }
    }
    const [fatching, setfatching] = useState(false);
    useEffect(() => {
        const loadData = async () => {
            if (userdata) {
                try {
                    setfatching(true);
                    // await new Promise(resolve => setTimeout(resolve, 2000));
                    await fechdata();
                    await caoch();

                } catch (error) {
                    console.log(error);
                } finally {
                    setfatching(false);
                }
            }
        };

        loadData();
    }, [userdata]);
    if (!userdata) {
        <div className="loader-overlay">
            <div className="loader-box">
                <div className="spinner-border" role="status"></div>
                <p className="loading-text">Loading...</p>
            </div>
        </div>
    }
    return (
        <>
            <Navbaradmin />

            <div className="admin-page">
                <div className="table-card">
                    <h3 className="table-title">Athlete List</h3>

                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Request</th>
                                    <th>Athelet Name</th>
                                    <th>Sport type</th>
                                    <th>Email</th>
                                    <th>Age</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fatching && (
                                    <div className="loader-overlay">
                                        <div className="loader-box">
                                            <div className="spinner-border" role="status"></div>
                                            <p className="loading-text">Loading...</p>
                                        </div>
                                    </div>
                                )}
                                {requestdata?.map((d, index) => (
                                    <tr key={d.rqid}>
                                        <td>{index + 1}</td>
                                        <td>{d.request}</td>
                                        <td>{d.athid?.name}</td>
                                        <td>{d.athid?.sporttype}</td>
                                        <td>{d.athid?.email}</td>
                                        <td>{d.athid?.age}</td>
                                        <td><button className='btn btn-success' type='submit' onClick={() => Atheletdata(d)}>{coachdata ? "alerady asign" : "Assign coach"} </button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {assigend && (
                <div className="custom-modal">
                    <div className="modal-card">
                        <button
                            className="close-btn"
                            onClick={() => setAssigend(null)}
                        >
                            ✖
                        </button>

                        <h4 className="modal-title">Assign Coach</h4>

                        <form onSubmit={formsubit}>
                            <input
                                type="hidden"
                                value={assigend.athid}
                                name="athid"
                            />

                            <select
                                name="coachid"
                                value={assigend.coachid?.coachid || ""}
                                className="form-control"
                                onChange={(e) =>
                                    setAssigend({
                                        ...assigend,
                                        coachid: { coachid: e.target.value },
                                    })
                                }
                                required
                            >
                                <option value="">Select Coach</option>
                                {coachdata.map((c) => (
                                    <option key={c.coachid} value={c.coachid}>
                                        {c.name} - {c.specialization}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="submit-btn mt-3" disabled={Loding}>
                                {Loding ? "Processing...." : "Asign"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default RequestCoach