import { useState, useEffect } from 'react'; // <-- FIX 1: Added useEffect import
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = "1007402569571-7s9h5cb32gfkf4atjpp5svgpt8tnalmr.apps.googleusercontent.com";
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // FIX 2: A single helper function to handle all routing
 const handleRedirection = (role) => {
    const routes = {
      'Student': "/student/dashboard",
      'Administrator': "/administrator/dashboard", // <--- UPDATE THIS KEY
      'Supervisor': "/supervisor/dashboard",
      'Panel Member': "/panel/dashboard"
    };
    
    const target = routes[role] || "/"; 
    navigate(target);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning("Email and password are required.");
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome back!");
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_role", data.user.role);
        
        handleRedirection(data.user.role); // Uses the helper function
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We create a function to handle the initialization
    const initGoogle = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse, 
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    };

    // If Google loaded fast, render immediately
    if (window.google) {
      initGoogle();
    } else {
      // If Google is slow, check every 100ms until it arrives
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle); // Stop checking
          initGoogle();               // Render button
        }
      }, 100);

      // Cleanup the interval if the user leaves the page before it loads
      return () => clearInterval(checkGoogle);
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/users/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Welcome back, ${data.user.first_name}!`);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_role", data.user.role);
        
        handleRedirection(data.user.role); // Uses the helper function
      } else {
        toast.error(data.message || "Google Login failed");
      }
    } catch (error) {
      toast.error("Connection to PASS server failed.");
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2b20d6]">Welcome to PASS</h2>
        <p className="text-gray-500 font-medium mt-2">University of Nairobi</p>
      </div>

      {/* STUDENT LOGIN SECTION */}
      <div className="bg-[#f8faff] p-6 rounded-2xl border border-blue-100 mb-8">
        <h3 className="text-sm font-extrabold text-[#2b20d6] uppercase tracking-wider mb-4 text-center">Student Portal</h3>
        <div id="googleBtn" className="flex justify-center"></div>
        <p className="text-xs text-gray-500 text-center mt-3 font-medium">
          *All students must log in using their official UoN Google account.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] bg-gray-200 flex-1"></div>
        <span className="text-gray-400 font-bold text-xs tracking-widest">STAFF & ADMIN</span>
        <div className="h-[1px] bg-gray-200 flex-1"></div>
      </div>

      {/* STAFF MANUAL LOGIN SECTION */}
      <form onSubmit={handleManualLogin} className="space-y-6">
        <div>
          <label className="text-xs font-extrabold text-[#2b20d6] uppercase tracking-wider block mb-2 ml-1">Staff Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-[#2b20d6] h-5 w-5" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or supervisor email" 
              className="w-full bg-[#f0f3ff] border border-blue-100 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2 ml-1 pr-1">
            <label className="text-xs font-extrabold text-[#2b20d6] uppercase tracking-wider block">Password</label>
            <button type="button" className="text-[#2b20d6] text-xs font-bold hover:underline">Forgot Password?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-[#2b20d6] h-5 w-5" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              className="w-full bg-[#f0f3ff] border border-blue-100 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] transition-all"
            />
            <button 
              type="button"
              className="absolute right-4 top-4 text-[#2b20d6] focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-[#0000ff] text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 mt-4 disabled:bg-blue-300"
        >
          {loading ? "Verifying..." : "Staff Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;