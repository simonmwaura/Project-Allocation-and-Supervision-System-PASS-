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

// Administrator Routes
import AdministratorLayout from './Administrator Pages/Administrator Component/AdministratorLayout'
import AdministratorDashboard from './Administrator Pages/AdministratorDashboard';
import ManageFaculty from './Administrator Pages/ManageFaculty'
import ImportData from './Administrator Pages/ImportData'
import AdministratorProfile from './Administrator Pages/AdministratorProfile'
import ManageStudents from './Administrator Pages/ManageStudents'

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

        {/* Administrator Routes */}
        <Route path="/administrator" element={<AdministratorLayout/>}>
           <Route path='dashboard' element={<AdministratorDashboard/>}/>
           <Route path='managefaculty' element={<ManageFaculty/>}/>
           <Route path='dataimport' element={<ImportData/>}/>

           <Route path='managestudents' element={<ManageStudents/>}/>
           <Route path='profile' element={<AdministratorProfile/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
