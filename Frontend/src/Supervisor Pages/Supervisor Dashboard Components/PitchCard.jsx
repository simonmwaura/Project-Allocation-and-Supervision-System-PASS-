import React from "react";
import { FiUser } from "react-icons/fi";

const BRAND = "#2b20d6";

const PitchCard = ({ studentName, regNumber, projectTitle, onReview }) => {
  return (
    <div
      className="bg-white border-[1.5px] rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow h-full"
      style={{ borderColor: BRAND }}
    >
      {/* Top Section: Avatar & Details */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{ backgroundColor: BRAND }}
        >
          <FiUser size={28} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-bold text-lg text-gray-900 truncate">{studentName}</h4>
          <p className="text-sm font-medium text-gray-500 truncate">{regNumber}</p>
        </div>
      </div>

      {/* Middle Section: Project Title */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        <p className="text-[15px] font-semibold text-gray-800 leading-snug">
          {projectTitle}
        </p>
      </div>

      {/* Bottom Section: Action Button */}
      <button
        onClick={onReview}
        className="w-full py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:opacity-90 transition-opacity mt-auto"
        style={{ backgroundColor: BRAND }}
      >
        Review Pitch
      </button>
    </div>
  );
};

export default PitchCard;