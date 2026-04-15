import React from "react";
import { FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom"; 

const BRAND = "#2b20d6";

const NoStudentFound = () => {
  return (
    <div
      className="bg-white border-[1.5px] rounded-3xl p-10 md:p-16 flex flex-col items-center text-center w-full max-w-2xl shadow-sm"
      style={{ borderColor: BRAND, color: BRAND }}
    >
      <h3 className="text-2xl md:text-3xl font-extrabold mb-6">No Student Found</h3>

      <div className="mb-8">
        <FiFileText size={140} strokeWidth={1.5} />
      </div>

      <p className="text-base md:text-lg font-semibold leading-relaxed mb-10 px-4">
        There are currently no students in the system. Please upload the official university CSV file to populate the student registry.
      </p>

      {/* Button automatically routes to your Import Data page */}
      <Link
        to="/administrator/dataimport"
        className="px-10 py-4 rounded-xl font-bold text-white text-base md:text-lg shadow-md hover:opacity-90 transition-opacity"
        style={{ backgroundColor: BRAND }}
      >
        Go to Import Data
      </Link>
    </div>
  );
};

export default NoStudentFound;