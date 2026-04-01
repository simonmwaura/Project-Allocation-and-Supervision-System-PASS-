import { FiGrid, FiFileText, FiUser, FiLogOut, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

const BRAND = "#2b20d6";

const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
          <Link
            to="/Dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/Dashboard") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            to="/MyProject"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/MyProject") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiFileText size={20} />
            My Project
          </Link>

          <Link
            to="/StudentProfile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full transition-colors"
            style={isActive("/StudentProfile") ? { background: BRAND, color: "#fff" } : { color: BRAND }}
          >
            <FiUser size={20} />
            Profile
          </Link>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base w-full text-left transition-colors"
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