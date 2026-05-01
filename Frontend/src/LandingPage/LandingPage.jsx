import Navbar from './Navbar';
import LoginForm from './LoginForm';
import Footer from './Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* This component stays invisible until a toast is triggered */}
      <ToastContainer 
        position="top-right"
        autoClose={30000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20 px-4" 
            style={{ background: 'linear-gradient(to right, #b4c6ff, #2b20d6)' }}>
        <LoginForm />
      </main>

      <div className="bg-[#f8faff] py-8 px-4">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;