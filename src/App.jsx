import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Home from '@/pages/auth/Home'
import Navbar from '@/components/layout/Navbar'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import AtheletDashboard from '@/pages/athlete/AtheletDashboard'
import CoachDashboard from '@/pages/coach/CoachDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Logout from '@/pages/auth/Logout'
import Registercoach from '@/pages/admin/Registercoach';
import Athdetails from '@/pages/admin/Athdetails'
import CoachDetails from '@/pages/admin/CoachDetails'
import FeedbackHistory from '@/pages/admin/FeedbackHistory'
import TraningSchedule from '@/pages/athlete/TraningSchedule'
import { UserContext } from '@/context/UserContext'
import ComplainCoach from '@/pages/athlete/ComplainCoach'
import AtheletDetailsCoach from '@/pages/coach/AtheletDetailsCoach'
import Traningschedulescoach from '@/pages/coach/Traningschedulescoach'
import Scheduleplan from '@/pages/coach/Scheduleplan'
import FeedBackHistoryCoach from '@/pages/coach/FeedBackHistoryCoach'
import Perfromancelog from '@/pages/coach/Perfromancelog'
import AtheletsAndWorkdril from '@/pages/coach/AtheletsAndWorkdril'
import ProtectedRoute from '@/routes/ProtectedRoute'
import RequestCoach from '@/pages/admin/RequestCoach'
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
          <Route path='/forgot-password' element={<ForgotPassword />} />
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
          <Route path='/requestcoach' element={<ProtectedRoute><RequestCoach /></ProtectedRoute>} />
          
          <Route path='/*' element={<Login />} />
        </Routes>

      </UserContext.Provider>
    </>
  )
}

export default App
