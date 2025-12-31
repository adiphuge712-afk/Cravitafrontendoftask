import React from 'react'
import Navbaradmin from './Navbaradmin'


const FeedbackHistory = ({user}) => {

  return (
    <>
    <Navbaradmin/>
    
    <table className='table table-borderd border '>
               <thead>
                 <tr className='border'>
                    <th>FeedBackId</th>
                    <th>Comment</th>
                    <th>DificultLevel</th>
                    <th>CoachId</th>
                    <th>AtheletId</th>
                    </tr>
               </thead>
      </table>
    </>
  )
}

export default FeedbackHistory