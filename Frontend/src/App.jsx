import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// temporary Page
import Home from './Home'

// Student Routes
import StudentDashboard from './Student Pages/StudentDashboard';
import MyProject from './Student Pages/MyProject'
import Profile from './Student Pages/Profile';
import StudentLayout from './Student Pages/Student Components/StudentLayout';

// Supervisor Routes
import SupervisorLayout from './Supervisor Pages/Supervisor Components/SupervisorLayout';
import SupervisorDashboard from './Supervisor Pages/SupervisorDashboard';
import MySupervisees from './Supervisor Pages/MySupervisees';
import MyPanel from './Supervisor Pages/MyPanel'
import SupervisorProfile from './Supervisor Pages/SupervisiorProfile'

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Home/>}/>
        {/* Student Routes */}
        <Route path='/student' element={<StudentLayout/>}>
          <Route path='dashboard' element={<StudentDashboard/>}/>
          <Route path="myProject" element={<MyProject/>}/>
          <Route path="profile" element={<Profile/>}/>
        </Route>

        {/* Supervisor Routes */}
        <Route path="/supervisor" element={<SupervisorLayout/>}>
           <Route path='dashboard'element={<SupervisorDashboard/>}/>
           <Route path='mysupervisees' element={<MySupervisees/>}/>
           <Route path='mypanel' element={<MyPanel/>}/>
           <Route path='profile' element={<SupervisorProfile/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
