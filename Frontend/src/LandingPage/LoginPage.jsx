import Navbar from './Navbar';
import LoginForm from './LoginForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="colored"
      />
      
      <Navbar />
      
      {/* Split screen layout for desktop */}
      <main className="flex-grow flex flex-col md:flex-row">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </div>

        {/* Right Side - Branding/Gradient */}
        <div 
          className="hidden md:flex w-full md:w-1/2 items-center justify-center p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #302AE2, #5a54e8)' }}
        >
          {/* Glassmorphism card overlay */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-[3rem] text-white max-w-md shadow-2xl relative z-10">
            <h2 className="text-4xl font-black mb-6 leading-tight">Secure Academic Authentication</h2>
            <p className="text-lg font-medium text-white/80 leading-relaxed mb-8">
              Log in to access your customized dashboard, manage project submissions, and review panel assignments.
            </p>
            <div className="w-16 h-1 bg-white/50 rounded-full"></div>
          </div>

          {/* Abstract circles */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;