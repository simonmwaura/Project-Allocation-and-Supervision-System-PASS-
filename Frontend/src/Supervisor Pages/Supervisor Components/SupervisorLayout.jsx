import { useState } from "react";
import SupervisorSidebar from "./SupervisorSidebar";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

const SupervisorLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <SupervisorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 p-4 ${
          isOpen ? "md:ml-64 ml-0" : "ml-0"
        }`}
      >
        <div
          className="min-h-full rounded-2xl p-6 relative"
          style={{ backgroundColor: "#eef0fb", border: "1.5px solid #2b20d6" }}
        >
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="mb-4 p-2 rounded-lg bg-white border border-blue-700 block"
              style={{ color: "#2b20d6" }}
            >
              <FiMenu size={24} />
            </button>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SupervisorLayout;