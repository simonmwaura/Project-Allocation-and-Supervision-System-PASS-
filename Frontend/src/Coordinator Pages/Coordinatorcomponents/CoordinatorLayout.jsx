import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CoordinatorSidebar from "./CoordinatorSidebar";

const CoordinatorLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
      <CoordinatorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 p-4 ${
          isOpen ? "md:ml-64 ml-0" : "ml-0"
        }`}
      >
<div
  className="min-h-full rounded-[2.5rem] p-8 relative shadow-2xl"
  style={{ 
    backgroundColor: "#ffffff", // Pure white for better contrast
    border: "1px solid rgba(43, 32, 214, 0.1)" // Very subtle border
  }}
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

export default CoordinatorLayout;