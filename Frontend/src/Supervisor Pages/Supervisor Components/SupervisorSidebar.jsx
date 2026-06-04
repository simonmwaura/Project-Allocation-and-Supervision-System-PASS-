import { FiGrid, FiUsers, FiClipboard, FiUser, FiLogOut, FiX, FiRefreshCw } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

const SupervisorSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const isActive  = (path) => location.pathname === path;

  // Login response stores role as "role" not "user_role"
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAlsoCoordinator = user.role === "Coordinator";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSwitch = () => {
    toast.info("Switching to Coordinator portal…");
    navigate("/coordinator/dashboard");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-blue-800 flex flex-col px-4 py-6 z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
          <Link to="/supervisor/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/dashboard") ? { background: BRAND, color: "#fff" } : { color: BRAND }}>
            <FiGrid size={20} /> Dashboard
          </Link>

          <Link to="/supervisor/mysupervisees"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/mysupervisees") ? { background: BRAND, color: "#fff" } : { color: BRAND }}>
            <FiUsers size={20} /> My Supervisees
          </Link>

          <Link to="/supervisor/mypanel"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/mypanel") ? { background: BRAND, color: "#fff" } : { color: BRAND }}>
            <FiClipboard size={20} /> My Panel
          </Link>

          <Link to="/supervisor/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/supervisor/profile") ? { background: BRAND, color: "#fff" } : { color: BRAND }}>
            <FiUser size={20} /> Profile
          </Link>

          {/* Toggle — only visible when the supervisor is also a Coordinator */}
          {isAlsoCoordinator && (
            <button
              onClick={handleSwitch}
              className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl font-semibold text-sm w-full text-left transition-all border-2 hover:opacity-90"
              style={{ backgroundColor: "#eef0ff", borderColor: BRAND, color: BRAND }}
            >
              <FiRefreshCw size={18} />
              Switch to Coordinator View
            </button>
          )}
        </nav>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full text-left hover:bg-gray-50 transition-colors"
            style={{ color: BRAND }}
          >
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SupervisorSidebar;