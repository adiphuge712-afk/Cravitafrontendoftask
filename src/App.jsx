import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Home from './Component/Home'
import Navbar from './Component/Navbar'
import Register from './Component/Register'
import Login from './Component/Login'
import AtheletDashboard from './Component/AtheletDashboard'
import CoachDashboard from './Component/CoachDashboard'
import AdminDashboard from './Component/AdminDashboard'
import Logout from './Component/Logout'
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
import AtheletsAndWorkdril from './Component/CoachComponents/AtheletsAndWorkdril'
import ProtectedRoute from './Component/ProtectedRoute'
function App() {
  const [user, setcontext] = useState(null);
  const location = useLocation();
  const showNavbarRoutes = ["/", "/login", "/register","/*"];
  const showNavbar = showNavbarRoutes.includes(location.pathname);

  return (
    <>
      <UserContext.Provider value={{ user, setcontext }}>
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login user={user} />}></Route>



          <Route path='/AtheletDashboard' element={<ProtectedRoute><AtheletDashboard user={user} /></ProtectedRoute>} />
          <Route path='/AdminDashboard' element={<ProtectedRoute><AdminDashboard user={user} /></ProtectedRoute>} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/addcoach' element={<ProtectedRoute><Registercoach user={user} /></ProtectedRoute>}></Route>
          <Route path='/atheletdetails' element={<ProtectedRoute><Athdetails user={user} /></ProtectedRoute>}></Route>
          <Route path='/Coachinfo' element={<ProtectedRoute><CoachDetails user={user} /></ProtectedRoute>} />
          <Route path='/feedbackhistory' element={<ProtectedRoute><FeedbackHistory user={user} /></ProtectedRoute>} />
          <Route path='/Schedule' element={<ProtectedRoute><TraningSchedule user={user} /></ProtectedRoute>} />
          <Route path='/atheletscoach' element={<ProtectedRoute><AtheletDetailsCoach user={user} /></ProtectedRoute>} />
          <Route path='/CoachDashboard' element={<ProtectedRoute><CoachDashboard user={user} /></ProtectedRoute>} />
          <Route path='/complian' element={<ProtectedRoute><ComplainCoach user={user} /></ProtectedRoute>} />
          <Route path='/Traningplans' element={<ProtectedRoute><Traningschedulescoach user={user} /></ProtectedRoute>} />
          <Route path='/Schedulecoach' element={<ProtectedRoute><Scheduleplan user={user} /></ProtectedRoute>} />
          <Route path='/feedbackhistorycoach' element={<ProtectedRoute><FeedBackHistoryCoach user={user} /></ProtectedRoute>} />
          <Route path='/Performancelog' element={<ProtectedRoute><Perfromancelog user={user} /></ProtectedRoute>} />
          <Route path='/AtheletsAndWorkdirl' element={<ProtectedRoute><AtheletsAndWorkdril user={user} /></ProtectedRoute>} />
          <Route path='/*' element={<Login />} />
        </Routes>

      </UserContext.Provider>
    </>
  )
}

export default App
