import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added these

// Temporary Page
import Home from './Home';

// Student Routes (Keep your existing imports)
import StudentLayout from './Student Pages/Student Components/StudentLayout';
import StudentDashboard from './Student Pages/StudentDashboard';
import MyProject from './Student Pages/MyProject';
import Profile from './Student Pages/Profile';
import UploadDocuments from './Student Pages/Student MyProject Components/UploadDocuments';
import SubmissionHistory from './Student Pages/Student MyProject Components/SubmissionHistory';
import CoordinatorNotices from './Student Pages/Student MyProject Components/CoordinatorNotices';
import ProjectOverview from './Student Pages/Student Dashboard Components/ProjectOverview';

// Supervisor Routes
import SupervisorLayout from './Supervisor Pages/Supervisor Components/SupervisorLayout';
import SupervisorDashboard from './Supervisor Pages/SupervisorDashboard';
import MySupervisees from './Supervisor Pages/MySupervisees';
import MyPanel from './Supervisor Pages/MyPanel';
import SupervisorProfile from './Supervisor Pages/SupervisiorProfile';
import SupervisorInterestsSetup from './Supervisor Pages/Supervisor Components/SupervisorInterestsSetup'; // <-- Import the new setup component

// Administrator Routes (Keep your existing imports)
import AdministratorLayout from './Administrator Pages/Administrator Component/AdministratorLayout';
import AdministratorDashboard from './Administrator Pages/AdministratorDashboard';
import ManageFaculty from './Administrator Pages/ManageFaculty';
import ImportData from './Administrator Pages/ImportData';
import AdministratorProfile from './Administrator Pages/AdministratorProfile';
import ManageStudents from './Administrator Pages/ManageStudents';


// --- NEW: The Supervisor Wrapper Component ---
// This acts as a "bouncer" to check if they need onboarding
const SupervisorWrapper = () => {
  // In a real app, you would fetch this boolean from your database or auth context
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating a database check to see if they already picked interests
    setTimeout(() => {
      setHasCompletedOnboarding(false); // Set to true to bypass the setup screen
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#302AE2] font-bold">Loading...</div>;
  }

  // If they haven't completed it, show the setup screen ONLY (No sidebar!)
  if (!hasCompletedOnboarding) {
    return (
      <SupervisorInterestsSetup 
        onComplete={(interests) => {
          console.log("Saving to DB:", interests);
          // Once they click confirm, we update state. 
          // React instantly removes the setup screen and loads the Dashboard!
          setHasCompletedOnboarding(true);
        }} 
      />
    );
  }

  // If they have completed it, render the normal Layout (which has the sidebar)
  return <SupervisorLayout />;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="myproject" element={<MyProject />} />
          <Route path="profile" element={<Profile />} />
          <Route path="upload-document" element={<UploadDocuments />} />
          <Route path="submission-history" element={<SubmissionHistory />} />
          <Route path="coordinator-notices" element={<CoordinatorNotices />} />
          <Route path="project-details" element={<ProjectOverview />} />
        </Route>

        {/* Supervisor Routes */}
        {/* FIX: Replaced <SupervisorLayout /> with our new <SupervisorWrapper /> */}
        <Route path="/supervisor" element={<SupervisorWrapper />}>
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="mysupervisees" element={<MySupervisees />} />
          <Route path="mypanel" element={<MyPanel />} />
          <Route path="profile" element={<SupervisorProfile />} />
        </Route>

        {/* Administrator Routes */}
        <Route path="/administrator" element={<AdministratorLayout />}>
          <Route path="dashboard" element={<AdministratorDashboard />} />
          <Route path="managefaculty" element={<ManageFaculty />} />
          <Route path="dataimport" element={<ImportData />} />
          <Route path="managestudents" element={<ManageStudents />} />
          <Route path="profile" element={<AdministratorProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;