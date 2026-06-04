import { FiGrid, FiUsers, FiClipboard, FiUser, FiLogOut, FiX, FiRefreshCw } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

const SupervisorSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // Retrieve user data to check if this Supervisor is also the Coordinator
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCoordinator = user.user_role === 'Coordinator' || (user.roles && user.roles.includes('Coordinator'));

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 2. Close the mobile sidebar if it's open
    setIsOpen(false);
    
    // 3. Show a quick toast (optional)
    toast.success("Logged out successfully");
    
    // 4. Redirect to the landing/login page
    navigate("/"); 
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-blue-800 flex flex-col px-4 py-6 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end mb-2">
          <button onClick={() => setIsOpen(false)} style={{ color: BRAND }} className="p-1">
            <FiX size={22} />
          </button>
        </div>

        <div className="text-center mb-8" style={{ color: BRAND }}>
          <div className="text-4xl font-bold tracking-wide">PASS</div>
          <div className="text-sm font-semibold">Supervisor Portal</div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link
            to="/supervisor/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/dashboard") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            to="/supervisor/mysupervisees"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/mysupervisees") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUsers size={20} />
            My Supervisees
          </Link>

          <Link
            to="/supervisor/mypanel"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/mypanel") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiClipboard size={20} />
            My Panel
          </Link>

          <Link
            to="/supervisor/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/profile") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUser size={20} />
            Profile
          </Link>

          {/* IDENTITY SWITCHER: Only visible if the user is a Coordinator */}
          {isCoordinator && (
            <button
              onClick={() => navigate('/coordinator/dashboard')}
              className="flex items-center gap-3 px-4 py-3 mt-6 rounded-xl font-semibold text-base w-full text-left bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
              style={{ color: BRAND }}
            >
              <FiRefreshCw size={20} />
              Switch to Coordinator
            </button>
          )}
        </nav>

        {/* Separated Logout button for a cleaner layout */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full text-left transition-colors hover:bg-gray-50"
            style={{ color: BRAND }}
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SupervisorSidebar;