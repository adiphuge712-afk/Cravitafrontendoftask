import React, { useEffect, useState } from 'react'
import Navbaradmin from './Navbaradmin'
import axios from 'axios';

const Athdetails = ({ user }) => {
  const [coachdata, setCoach] = useState(null);
  const caoch = async () => {
    try {
      const datas = await axios.get('http://localhost:8056/viewDataCoach');
      // alert('datafatch');
      setCoach(datas.data);
      console.log(datas.data);

    } catch (err) {
      console.log(err);
      alert('fail');

    }
  }
  const [assigend, setAssigend] = useState(null);
  const admindta = (d) => {
    setAssigend({
      athid: d.athid,
      coachid: {
        coachid: d.coachid?.coachid || ""
      }


    });

  }
  const [athdata, setAthdata] = useState([]);
  const fatchdata = async () => {
    try {
      const res = await axios.get('http://localhost:8056/viewDataAthlet');
      setAthdata(res.data);
    } catch (error) {
      console.log(error);
      alert('fail to fetch data');
    }
  }
  const formsubit = async (e) => {
    e.preventDefault();
    try {
      const sub = await axios.post("http://localhost:8056/AssigendCoach", assigend);
      fatchdata();
      alert(sub.data);
      setAssigend(null);


    } catch (error) {
      console.log(error);
      alert('fail');
    }
  }
  useEffect(() => {
    caoch();
    fatchdata();
  }, []);
  return (
    <>
      <Navbaradmin />

      <table className='table table-borderd border text-center '>
        <thead className='table-danger'>
          <tr className='border'>
            <th>AtheletId</th>
            <th>AtheletName</th>
            <th>Email</th>
            <th>Sport Type</th>
            <th>Age</th>
            <th>CoachId</th>
            <th>Add Coach</th>
          </tr>
        </thead>
        <tbody className='table-primary'>

          {athdata.map((d, index) => (
            <tr key={d.athid}>
              <td>{index + 1}</td>
              <td>{d.name}</td>
              <td>{d.email}</td>
              <td>{d.sporttype}</td>
              <td>{d.age}</td>
              <td>
                {d.coachid === null
                  ? "Coach not assigned yet"
                  : d.coachid.coachid}
              </td>

              <td>
                <button className='btn btn-primary' onClick={() => admindta(d)}>Assigend Coach</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {assigend && (
        <>
          <div className='align-content-center position-fixed top-0 start-0 w-100 h-100 bg-dark  bg-opacity-75' style={{ zIndex: 1040 }}>

            <div className="row mb-4">
              <div className="col-sm-4"></div>
              <div className="col-sm-4 border shadow bg-light rounded p-3">
                <form onSubmit={formsubit}>

                  <h3 className='text-center'>Assiend  Coach</h3>
                  <button className='btn btn-danger position-absolute top-0 end-0 m-2' onClick={() => {
                    setAssigend(null);
                  }} style={{ zIndex: 7750 }}>Close</button>

                  <input type="hidden" value={assigend.athid} onChange={(e) => setAssigend({ ...assigend, athid: e.target.value })} name='athid' className="form-control mt-2 p-2" required />
                  {/* <input type="text" value={assigend.name} onChange={(e) => setAssigend({ ...assigend, name: e.target.value })} name='name' className="form-control mt-2 p-2" required /> */}
                  {/* <input type="text" value={assigend.coachid.coachid} onChange={(e) => setAssigend({ ...assigend, coachid:{coachid:e.target.value} })} name='coachid' className="form-control mt-2 p-2"  /> */}
                  <select name="coachid" value={assigend.coachid.coachid} className="form-control mt-2" onChange={(e) => setAssigend({ ...assigend, coachid: { coachid: e.target.value } })} placeholder="Select the Coach" >
                    <option value="">Select the coachid</option>
                    {coachdata.map((c) => (
                      <option key={c.coachid} value={c.coachid}>
                        {c.coachid}&nbsp;&nbsp;
                        {c.name}
                      </option>
                    ))}

                  </select>
                  <div className="d-flex justify-content-center my-2">
                    <button type="submit" className='btn btn-primary'>Assiend</button>
                  </div>
                </form>
              </div>
              <div className="col-sm-4"></div>
            </div>
          </div>

        </>
      )}
    </>
  )
}

export default Athdetails