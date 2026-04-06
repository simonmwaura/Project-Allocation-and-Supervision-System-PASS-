import React from "react";
// FIX: You must import the icon and the Link!
import { FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom";

const NoActiveProject = () => {
   return (
    <div className="flex flex-col items-center justify-center p-8 md:p-14 lg:p-16 bg-white border-2 border-[#2b20d6] rounded-2xl lg:rounded-3xl w-full max-w-lg md:max-w-2xl mx-auto shadow-sm transition-all duration-300">
      
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2b20d6] mb-6 lg:mb-8 text-center tracking-wide">
        No Active Project
      </h2>

      {/* Document Icon */}
      <div className="text-[#2b20d6] mb-6 lg:mb-8">
        <FiFileText className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" strokeWidth={1.5} />
      </div>

      {/* Subtext */}
      <p className="text-[#2b20d6] text-center text-base md:text-lg lg:text-xl font-semibold leading-relaxed px-4 md:px-10 mb-8 lg:mb-10">
        You have not been assigned a supervisor yet. Please return to the Dashboard to submit a project pitch.
      </p>

      {/* Action Button */}
      <Link 
        to="/Dashboard" 
        className="bg-[#2b20d6] hover:bg-blue-800 active:bg-blue-900 text-white font-bold py-3.5 px-8 md:px-10 rounded-xl transition-colors text-lg shadow-md"
      >
        Go to Dashboard
      </Link>

    </div>
  );
}

export default NoActiveProject;