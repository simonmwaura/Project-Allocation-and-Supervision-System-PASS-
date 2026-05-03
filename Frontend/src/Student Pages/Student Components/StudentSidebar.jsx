import { FiGrid, FiFileText, FiUser, FiLogOut, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- ADDED useNavigate
import { toast } from "react-toastify"; // <-- ADDED toast for smooth UX

const BRAND = "#2b20d6";

const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate(); // <-- INITIALIZED navigate

  const isActive = (path) => location.pathname === path;

  // --- NEW: Logout Handler ---
  const handleLogout = () => {
    // 1. Clear the authentication data from the browser
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");

    // 2. Show a goodbye message
    toast.info("Logged out successfully.");

    // 3. Redirect the user back to the Landing/Login page
    navigate("/");
  };

  return (
    <>
      {/* Background overlay for mobile */}
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
          <div className="text-sm font-semibold">Student Portal</div>
        </div>

        <nav className="flex flex-col gap-2">
          {/* --- FIXED: isActive paths now match the 'to' paths --- */}
          <Link
            to="/student/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/student/dashboard") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            to="/student/myproject"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/student/myproject") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiFileText size={20} />
            My Project
          </Link>

          <Link
            to="/student/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/student/profile") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUser size={20} />
            Profile
          </Link>

          {/* --- UPDATED: Attached handleLogout --- */}
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

export default StudentSidebar;