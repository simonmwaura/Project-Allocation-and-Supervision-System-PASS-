import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added these

// Temporary Page
import LandingPage from './LandingPage/LandingPage';

// Student Routes (Keep your existing imports)
import StudentLayout from './Student Pages/Student Components/StudentLayout';
import StudentDashboard from './Student Pages/StudentDashboard';
import MyProject from './Student Pages/MyProject';
import Profile from './Student Pages/Profile';
import UploadDocuments from './Student Pages/Student MyProject Components/UploadDocuments';
import SubmissionHistory from './Student Pages/Student MyProject Components/SubmissionHistory';
import CoordinatorNotices from './Student Pages/Student MyProject Components/CoordinatorNotices';
import ProjectOverview from './Student Pages/Student Dashboard Components/ProjectOverview';
import StudentWrapper from './Student Pages/Student Components/StudentWrapper';

// Supervisor Routes
import SupervisorLayout from './Supervisor Pages/Supervisor Components/SupervisorLayout';
import SupervisorDashboard from './Supervisor Pages/SupervisorDashboard';
import MySupervisees from './Supervisor Pages/MySupervisees';
import MyPanel from './Supervisor Pages/MyPanel';
import SupervisorProfile from './Supervisor Pages/SupervisiorProfile';
import SupervisorInterestsSetup from './Supervisor Pages/Supervisor Components/SupervisorInterestsSetup'; // <-- Import the new setup component
import EditResearchInterests from "./Supervisor Pages/EditResearchInterests"; // Import it

// Administrator Routes (Keep your existing imports)
import AdministratorLayout from './Administrator Pages/Administrator Component/AdministratorLayout';
import AdministratorDashboard from './Administrator Pages/AdministratorDashboard';
import ManageFaculty from './Administrator Pages/ManageFaculty';
import ImportData from './Administrator Pages/ImportData';
import AdministratorProfile from './Administrator Pages/AdministratorProfile';
import ManageStudents from './Administrator Pages/ManageStudents';
import FacultyDetails from './Administrator Pages/Manage Faculty Components/FacultyDetails';
import DataImport from './Administrator Pages/DataImport/DataImport';


// --- NEW: The Supervisor Wrapper Component ---
// This acts as a "bouncer" to check if they need onboarding
// --- NEW: The REAL Supervisor Wrapper Component ---
const SupervisorWrapper = () => {
  const navigate = useNavigate();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [supervisorName, setSupervisorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { 
          navigate("/"); 
          return; 
        }

        // Ask Flask if this supervisor is done with onboarding
        const response = await fetch("http://127.0.0.1:5000/api/supervisors/onboarding-status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
          // If true, they go to dashboard. If false, they stay on setup screen.
          setHasCompletedOnboarding(data.onboarding_complete);
          
          // Get their name from local storage to say "Welcome, Simon"
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          setSupervisorName(user?.first_name || "Supervisor");
        } else {
          // Token invalid or profile not found
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboarding();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#302AE2] text-xl font-bold animate-pulse">
        Checking profile status...
      </div>
    );
  }

  // If false, show the setup screen ONLY (No sidebar!)
  if (!hasCompletedOnboarding) {
    return (
      <SupervisorInterestsSetup 
        supervisorName={supervisorName}
        onComplete={() => setHasCompletedOnboarding(true)} 
      />
    );
  }

  // If true, render the normal Layout (which has the sidebar)
  return <SupervisorLayout />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Student Routes */}
       <Route path="/student" element={<StudentWrapper />}>
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
          <Route path="edit-interests" element={<EditResearchInterests />} />
        </Route>

        {/* Administrator Routes */}
        <Route path="/administrator" element={<AdministratorLayout />}>
          <Route path="dashboard" element={<AdministratorDashboard />} />
          <Route path="managefaculty" element={<ManageFaculty />} />
          <Route path="managefaculty/:id" element={<FacultyDetails />} />
          <Route path="dataimport" element={<DataImport />} />
          <Route path="managestudents" element={<ManageStudents />} />
          <Route path="profile" element={<AdministratorProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;