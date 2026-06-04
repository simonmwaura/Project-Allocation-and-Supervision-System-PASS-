import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BRAND = "#302AE2";

const LoginForm = () => {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = "1007402569571-7s9h5cb32gfkf4atjpp5svgpt8tnalmr.apps.googleusercontent.com";
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);

  const handleRedirection = (role) => {
    const routes = {
      'Student': "/student/dashboard",
      'Administrator': "/administrator/dashboard",
      'Supervisor': "/supervisor/dashboard",
      'Coordinator': "/coordinator/dashboard",
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
        toast.success(`Welcome back, ${data.user.first_name}!`);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user)); 
        localStorage.setItem("user_role", data.user.role);
        
        handleRedirection(data.user.role);
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
    const initGoogle = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse, 
      });

      // FIXED BUG: Google SDK requires an integer (pixels) for width, not a string percentage.
      // We pass the ref and set a specific pixel width to prevent the console crash.
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", width: 340 } 
        );
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle); 
          initGoogle();               
        }
      }, 100);
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
        localStorage.setItem("user", JSON.stringify(data.user)); 
        localStorage.setItem("user_role", data.user.role);
        
        handleRedirection(data.user.role);
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
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black" style={{ color: BRAND }}>Welcome Back</h2>
        <p className="text-gray-500 font-medium mt-2">Sign in to continue to PASS</p>
      </div>

      {/* STUDENT LOGIN SECTION */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 mb-8 flex flex-col items-center">
        <h3 className="text-xs font-extrabold uppercase tracking-wider mb-5 text-center" style={{ color: BRAND }}>
          Student Portal
        </h3>
        {/* Using a wrapper div to center the Google button with fixed width */}
        <div className="flex justify-center w-full overflow-hidden">
            <div ref={googleButtonRef}></div>
        </div>
        <p className="text-[11px] text-gray-500 text-center mt-4 font-semibold uppercase tracking-wider">
          Requires official UoN Google account
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Staff & Admin</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* STAFF MANUAL LOGIN SECTION */}
      <form onSubmit={handleManualLogin} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Staff Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@uonbi.ac.ke" 
              className="w-full bg-slate-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 font-medium text-gray-700 outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2 ml-1 pr-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Password</label>
            <button type="button" className="text-xs font-bold hover:underline" style={{ color: BRAND }}>Forgot?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              className="w-full bg-slate-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-12 font-medium text-gray-700 outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
            />
            <button 
              type="button"
              className="absolute right-4 top-4 text-gray-400 focus:outline-none hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg active:scale-95 mt-2 disabled:opacity-60 flex justify-center items-center"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? "Authenticating..." : "Sign In securely"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;