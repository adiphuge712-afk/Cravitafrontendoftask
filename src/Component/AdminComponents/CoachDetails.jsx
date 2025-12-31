import React, { useEffect, useState } from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';

const CoachDetails = ({user}) => {
    const [coachdat, setCoachData] = useState([]);
    const [edit, sededit] = useState(null);
    const fectdata = async () => {
        try {
            const data = await axios.get('http://localhost:8056/viewDataCoach');
            // alert('datafatch');
            setCoachData(data.data);
        } catch (err) {
            console.log(err);
            alert('fail');

        }
    }
    useEffect(() => {
        fectdata();
    }, []);//only run when data get change  and run for ones
    const deletestudent = async (id) => {
        // alert("id is "+id);
        if (window.confirm('Are your Sure???')) {
            try {
                const del = await axios.delete(`http://localhost:8056/viewDataCoach/${id}`);
                if (del.data) {
                    alert('deleted data');
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
         await axios.put(`http://localhost:8056/viewDataCoach/${edit.coachid}`,edit);
        alert('Data is Updated');
        sededit(null);
        fectdata();
       } catch (error) {
        console.log(error);
        alert('Data not updated!!!!!!');
       }
    }
    return (
        <>
            <Navbaradmin />
            <table className='table table-borderd border '>
                <tr className='border'>
                    <th>CoachId</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Spesilization</th>
                    <th>Experience</th>
                    <th>AdminId & Name</th>
                    {/* <th>Athlate id</th> */}
                    <th className='text-center'>Modifiy</th>
                </tr>
                {coachdat.map((d, index) => (
                    <tr className='border' key={d.coachid}>
                        <td>{index + 1}</td>
                        <td>{d.name}</td>
                        <td>{d.email}</td>
                        <td>{d.age}</td>
                        <td>{d.specialization}</td>
                        <td>{d.experience}</td>
                        <td>{d.adid.adminid}&nbsp;&nbsp;{d.adid.name}</td>
                       
                        <td>
                            <button className='btn btn-danger mx-2' onClick={() => deletestudent(d.coachid)}>Delete</button>
                            <button className='btn btn-info mx-2' onClick={() => profileedit(d)}>Profile edit</button>
                        </td>
                    </tr>
                ))}
            </table>
            {
                edit && (
                    <div className='align-content-center position-fixed top-0 start-0 w-100 h-100 bg-dark  bg-opacity-75'style={{ zIndex: 1040 }}>

                    <div className="row mb-4">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-4 border shadow bg-light rounded p-3">
                            <form onSubmit={formedit}>
                                
                                <h3 className='text-center'>Register Coach</h3>
                                    <button className='btn btn-danger position-absolute top-0 end-0 m-2'onClick={()=>{
                                        sededit(null)
                                    }} style={{zIndex:7750}}>Close</button>
 {/* <input type="hidden" value={edit.adid.adminid} onChange={(e) => sededit({ ...edit, adminid: e.target.value })} name='adminid'className="form-control mt-2 p-2"  required /> */}
                                <input type="hidden" value={edit.coachid} onChange={(e) => sededit({ ...edit, name: e.target.value })} name='coachid'className="form-control mt-2 p-2"  required />
                                <input type="text" value={edit.name} onChange={(e) => sededit({ ...edit, name: e.target.value })} name='name' id='name' className="form-control mt-2 p-2" placeholder='Enter the Name' required />
                                <input type="email" value={edit.email} onChange={(e) => sededit({ ...edit, email: e.target.value })} name="email" id='email' className="form-control mt-2 p-2" placeholder='Enter the Email' required />
                                <input type="password" value={edit.password} onChange={(e) => sededit({ ...edit, password: e.target.value })} name='password' id='pass' className="form-control mt-2 p-2" placeholder='Enter the Password' required />
                                <input type="text" value={edit.experience} onChange={(e) => sededit({ ...edit, experience: e.target.value })} name='experience' id='Exp' className="form-control mt-2 p-2" placeholder='Enter the Experience' required />
                                <select name="specialization"  className='form-control my-2' value={edit.specialization} onChange={(e) => sededit({ ...edit, specialization: e.target.value })} required>
                                    <option value="">Select the sport type</option>
                                    <option value="Cricket">Cricket</option>
                                    <option value="Khokho">Kho-Kho</option>
                                    <option value="Caroom">Caroom</option>
                                    <option value="Chesh">Chesh</option>
                                    <option value="Mallakham">Mallakham</option>
                                    <option value="Hollyboll">Hollyboll</option>
                                    <option value="Footboll">Footboll</option>
                                </select>
                                <input type="text" value={edit.age} onChange={(e) => setData({ ...edit, age: e.target.value })} name='age' id='age' className="form-control mt-2 p-2" placeholder='Enter the Age' required />

                                <div className="d-flex justify-content-center my-2">
                                    <button type="submit"className='btn btn-primary'>Update</button>
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

export default CoachDetails