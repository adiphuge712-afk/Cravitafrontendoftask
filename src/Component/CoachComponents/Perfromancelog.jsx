import React from 'react'
import NavbarCoach from './NavbarCoach'

const Perfromancelog = () => {
  return (
   <>
   <NavbarCoach/>
    <table className='table table-borderd border '>
               <thead className='table-dark'>
                 <tr className='border'>
                    <th>Performance Id</th>
                    <th>Date</th>
                    <th>Fatiquelevel</th>
                    <th>Performancematrix</th>
                    <th>Coach Name</th>
                    <th>AtheletId</th>
                    <th>Workname</th>
                    </tr>
                </thead>
    </table>
   </>
  )
}

export default Perfromancelog