import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Temporary Page
import LandingPage from './LandingPage/LandingPage';
import LoginPage from './LandingPage/LoginPage';

// Student Routes
import StudentDashboard from './Student Pages/StudentDashboard';
import MyProject from './Student Pages/MyProject';
import Profile from './Student Pages/Profile';
import StudentWrapper from './Student Pages/Student Components/StudentWrapper'
import ProjectOverview from "./Student Pages/Student Dashboard Components/ProjectOverview"
import CoordinatorNotices from "./Student Pages/Student MyProject Components/CoordinatorNotices"
import SubmissionHistory from "./Student Pages/Student MyProject Components/SubmissionHistory"
import UploadDocuments from "./Student Pages/Student MyProject Components/UploadDocuments"


// Supervisor Routes
import SupervisorDashboard from './Supervisor Pages/SupervisorDashboard';
import MySupervisees from './Supervisor Pages/MySupervisees';
import MyPanel from './Supervisor Pages/MyPanel';
import SupervisorProfile from './Supervisor Pages/SupervisiorProfile';
import SupervisorWrapper from './Supervisor Pages/Supervisor Components/SupervisorWrapper';
import EditResearchInterests from './Supervisor Pages/EditResearchInterests'

// Administrator Routes
import AdministratorLayout from './Administrator Pages/Administrator Component/AdministratorLayout';
import AdministratorDashboard from './Administrator Pages/AdministratorDashboard';
import ManageFaculty from './Administrator Pages/ManageFaculty';
import AdministratorProfile from './Administrator Pages/AdministratorProfile';
import ManageStudents from './Administrator Pages/ManageStudents';
import FacultyDetails from './Administrator Pages/Manage Faculty Components/FacultyDetails';
import DataImport from './Administrator Pages/DataImport/DataImport';

// Coordinator Routes
import CoordinatorDashboard from "./Coordinator Pages/CoordinatorDashboard";
import CoordinatorStudents from "./Coordinator Pages/CoordinatorStudents";
import CoordinatorSupervisors from "./Coordinator Pages/CoordinatorSupervisors";
import CoordinatorPanels from "./Coordinator Pages/Panels"; 
import CoordinatorProfile from "./Coordinator Pages/CoordinatorProfile";
import CoordinatorWrapper from './Coordinator Pages/Coordinatorcomponents/CoordinatorWrapper';
import PanelSetup from './Coordinator Pages/Coordinator Panel Components/PanelSetup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── Student portal ──────────────────────────────────────────── */}
        <Route path="/student" element={<StudentWrapper />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="myproject" element={<MyProject />} />
          <Route path="profile" element={<Profile />} />
          <Route path="project-details" element={<ProjectOverview />} />
          <Route path="coordinator-notices" element={<CoordinatorNotices/>}/>
          <Route path="submission-history" element = {<SubmissionHistory/>}/>
          <Route path="upload-document" element={<UploadDocuments/>}/>
        </Route>

        {/* ── Supervisor portal ───────────────────────────────────────── */}
        <Route path="/supervisor" element={<SupervisorWrapper />}>
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="mysupervisees" element={<MySupervisees />} />
          <Route path="mypanel" element={<MyPanel />} />
          <Route path="profile" element={<SupervisorProfile />} />
          <Route path="edit-interests" element={<EditResearchInterests />} />
          

        </Route>

        {/* ── Coordinator portal ──────────────────────────────────────── */}
        <Route path="/coordinator" element={<CoordinatorWrapper />}>
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="students" element={<CoordinatorStudents />} />
          <Route path="supervisors" element={<CoordinatorSupervisors />} />
          <Route path="panels" element={<CoordinatorPanels />} /> 
          <Route path="profile" element={<CoordinatorProfile />} />
          <Route path="panels/:id" element={<PanelSetup />} />
        </Route>

        {/* ── Administrator portal ────────────────────────────────────── */}
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