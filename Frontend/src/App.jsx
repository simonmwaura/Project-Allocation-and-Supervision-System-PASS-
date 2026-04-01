import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Student Routes
import StudentDashboard from './Student Pages/StudentDashboard';
import MyProject from './Student Pages/MyProject'
import Profile from './Student Pages/Profile';
import StudentLayout from './Student Pages/Student Components/StudentLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<StudentLayout/>}>
          <Route path='Dashboard' element={<StudentDashboard/>}/>
          <Route path="MyProject" element={<MyProject/>}/>
          <Route path="StudentProfile" element={<Profile/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
