import Navbar from './Navbar';
// import Footer from './Footer'; // Assuming you have this
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiUsers, FiCheckCircle } from 'react-icons/fi';

const BRAND = "#302AE2";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ backgroundColor: BRAND }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 bg-white border shadow-sm" style={{ color: BRAND, borderColor: `${BRAND}30` }}>
            University of Nairobi
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
            Project Allocation <br/>& Supervision System
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl leading-relaxed">
            Streamlining the academic project lifecycle. Pitch supervisors, track milestones, and manage panel allocations all in one centralized workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              style={{ backgroundColor: BRAND }}
            >
              Access Portal <FiArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto px-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-50" style={{ color: BRAND }}>
              <FiBookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Centralized Workspace</h3>
            <p className="text-gray-500 font-medium text-sm">Upload milestone documents and track your project progress securely.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-50" style={{ color: BRAND }}>
              <FiUsers size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Allocation</h3>
            <p className="text-gray-500 font-medium text-sm">Pitch directly to available supervisors with strict capacity enforcement.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-50" style={{ color: BRAND }}>
              <FiCheckCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Panel Management</h3>
            <p className="text-gray-500 font-medium text-sm">Automated examination committee generation and student scheduling.</p>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;