import React from 'react'
import NavbarCoach from './NavbarCoach'
import { useState, useEffect } from 'react';
import axios from 'axios';


const FeedBackHistoryCoach = ({ user }) => {
    const [coachdat, setCoachData] = useState([]);
    const [performanceid, setPerformance] = useState([]);
    // const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get(`http://localhost:8056/viewDataFeedback/${user.coachid}`);
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    const fetchperformance = async () => {
        try {
            const data = await axios.get(`http://localhost:8056/viewDataPerformancelog/${user.coachid}`);
            // alert('datafatch');
            setPerformance(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    //for merch
    const mergedCoachData = coachdat.map(item => ({
        ...item,
        performances: performanceid.filter(p =>
            p.athid.athid === item.athid.athid &&
            p.workid.plan.coachid.coachid === user.coachid
        )
    }));
    console.log("the mergedat is " + mergedCoachData);

    useEffect(() => {

        fectdata();
        fetchperformance();
    }, []);

    return (
        <>
            <NavbarCoach />

            <table className='table table-bordered border '>
                <thead className='table-primary'>
                    <tr className='border'>
                        <th>FeedBackId</th>
                        <th>Comment</th>
                        <th>DificultLevel</th>
                        <th>AtheletId</th>
                        <th>Athelet Name</th>
                        <th>Sportname</th>
                        <th>Work Name</th>
                        <th>Plan Name</th>
                    </tr>
                </thead>
                <tbody className='table-secondary'>
                    {/* {coachdat.map((d,index)=>(
                  <tr key={d.feedid}>
                    <td>{index+1}</td>
                    <td>{d.comment}</td>
                    <td>{d.difficultlevel}</td>
                    <td>{d.athid.athid}</td>
                    <td>{d.athid.name}</td>
                  </tr>
                ))} */}

                    {mergedCoachData.map((c, index) => (
                        <React.Fragment key={c.athid.athid}>

                            {/* Athlete Row */}
                            <tr className="table-secondary">
                                <td>{index + 1}</td>
                                <td>{c.comment}</td>
                                <td>{c.difficultlevel}</td>
                                <td>{c.athid.athid}</td>
                                <td>{c.athid.name}</td>
                                <td>{c.athid.sporttype}</td>


                                <td>
                                    {c.performances.length > 0
                                        ? c.performances.map(p => p.workid.workname).join(", ")
                                        : "No Work"}
                                </td>

                                <td>
                                    {c.performances.length > 0
                                        ? [...new Set(c.performances.map(p => p.workid.plan.planname))].join(", ")
                                        : "No Plan"}
                                </td>
                            </tr>



                        </React.Fragment>
                    ))}

                </tbody>
            </table>
        </>
    )
}

export default FeedBackHistoryCoach