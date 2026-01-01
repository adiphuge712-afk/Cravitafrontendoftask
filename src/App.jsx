import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Component/Home'
import Navbar from './Component/Navbar'
import Register from './Component/Register'
import Login from './Component/Login'
import AtheletDashboard from './Component/AtheletDashboard'
import CoachDashboard from './Component/CoachDashboard'
import AdminDashboard from './Component/AdminDashboard'
import Logout from './utils/Logout'
import Registercoach from './Component/AdminComponents/Registercoach';
import Athdetails from './Component/AdminComponents/Athdetails'
import CoachDetails from './Component/AdminComponents/CoachDetails'
import FeedbackHistory from './Component/AdminComponents/FeedbackHistory'
import TraningSchedule from './Component/AthletComponent/TraningSchedule'
import { UserContext } from './Component/Context/UserContext'
import ComplainCoach from './Component/AthletComponent/ComplainCoach'
import AtheletDetailsCoach from './Component/CoachComponents/AtheletDetailsCoach'
import Traningschedulescoach from './Component/CoachComponents/Traningschedulescoach'
import Scheduleplan from './Component/CoachComponents/Scheduleplan'
import FeedBackHistoryCoach from './Component/CoachComponents/FeedBackHistoryCoach'
import Perfromancelog from './Component/CoachComponents/Perfromancelog'
function App() {
 const [user,setcontext]=useState(null);

  return (
   <>
   <UserContext.Provider value={{user,setcontext}}>
    <Navbar/>
    <Routes>
         <Route path="/" element={<Home />} />
        <Route path='/register' element={<Register/>}></Route>
      <Route path='/login' element={<Login user={user}/>}></Route>
      <Route path='/AtheletDashboard' element={<AtheletDashboard/>}/>
       <Route path='/AdminDashboard' element={<AdminDashboard user={user}/>}/>
        
       <Route path='/logout' element={<Logout/>}/>
       <Route path='/addcoach' element={<Registercoach user={user}/>}></Route>
       <Route path='/atheletdetails' element={<Athdetails user={user}/>}></Route>
      <Route path='/Coachinfo' element={<CoachDetails user={user}/>}/>
       <Route path='/feedbackhistory' element={<FeedbackHistory user={user}/>}/> 
       <Route path='/Schedule' element={<TraningSchedule/>}/>
       <Route path='/atheletscoach' element={<AtheletDetailsCoach user={user}/>}/>
        <Route path='/CoachDashboard' element={<CoachDashboard/>}/>
         <Route path='/complian' element={<ComplainCoach user={user}/>}/>
         <Route path='/Traningplans' element={<Traningschedulescoach  user={user}/>}/>
         <Route path='/Schedulecoach' element={<Scheduleplan user={user}/>}/>
         <Route path='/feedbackhistorycoach' element={<FeedBackHistoryCoach user={user} />}/>
         <Route path='/Performancelog'element={<Perfromancelog user={user}/>}/>
      </Routes>
    
     </UserContext.Provider>
    </>
  )
}

export default App
