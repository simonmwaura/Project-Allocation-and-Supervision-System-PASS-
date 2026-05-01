import { FiGrid, FiUsers, FiUpload, FiUser, FiLogOut, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- ADDED useNavigate
import { toast } from "react-toastify"; // <-- ADDED toast for smooth UX

const BRAND = "#2b20d6";

const AdministratorSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate(); // <-- INITIALIZED navigate

  const isActive = (path) => location.pathname === path;

  // --- NEW: Logout Handler ---
  const handleLogout = () => {
    // 1. Clear the authentication data from the browser
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");

    // 2. Optional: Show a goodbye message
    toast.info("Logged out successfully.");

    // 3. Redirect the user back to the Landing/Login page
    navigate("/");
  };

  return (
    <>
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
          <div className="text-sm font-semibold">Administrator Portal</div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            to="/administrator/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/administrator/dashboard") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            to="/administrator/managefaculty"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/administrator/managefaculty") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUsers size={20} />
            Manage Faculty
          </Link>

          <Link
            to="/administrator/managestudents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/administrator/managestudents") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUsers size={20} />
            Manage Students
          </Link>

          <Link
            to="/administrator/dataimport"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/administrator/dataimport") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUpload size={20} />
            Import Data
          </Link>

          <Link
            to="/administrator/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/administrator/profile") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUser size={20} />
            Profile
          </Link>

          {/* --- UPDATED: Attached the handleLogout function to the button --- */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full text-left transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ color: BRAND }}
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default AdministratorSidebar;