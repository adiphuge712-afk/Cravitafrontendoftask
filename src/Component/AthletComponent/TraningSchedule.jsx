import React from 'react'
import NavbarOfAth from '../NavbarOfAth'

const TraningSchedule = () => {
  return (
   <>
   <NavbarOfAth/>
    <table className='table table-borderd border '>
               <thead>
                 <tr className='border'>
                    <th>PlanId</th>
                    <th>Planname</th>
                    <th>Plan Name</th>
                    <th>StartDate</th>
                    <th>EndDate</th>
                    <th className='text-center'>Modifiy</th>
                </tr>
               </thead>
     </table>
   </>
  )
}

export default TraningSchedule