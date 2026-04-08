import React from "react";
import { FiArrowLeft, FiClock } from "react-icons/fi";

const BRAND = "#302AE2";

const PendingPitchDetails = ({ pitchData, onBack, onWithdrawClick }) => {
  // Fallback data in case it's not passed properly
  const data = pitchData || {
    supervisorName: "Mark Antony",
    projectTitle: "Smart Highway Enforcement System",
    projectPitch: "Currently, traffic law enforcement on major Kenyan highways relies heavily on manual policing, which is resource-intensive and prone to human error. This project proposes a Smart Highway Enforcement System utilizing computer vision to automate the detection of speeding vehicles. The system will process video feeds, capture license plates of violating vehicles via Optical Character Recognition (OCR), and log the data into a centralized web dashboard built with React and Flask. This solution aims to improve road safety and provide traffic authorities with an efficient, automated tracking mechanism."
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-6 pb-12">
      
      {/* Header Container */}
      <div className="relative w-full max-w-4xl flex items-center justify-center mb-8">
        <div className="absolute left-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BRAND }}
          >
            <FiArrowLeft size={18} strokeWidth={3} />
            Back to Supervisor Selection
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div 
        className="bg-white rounded-2xl border flex flex-col items-center w-full max-w-2xl px-10 py-10 shadow-sm"
        style={{ borderColor: BRAND }}
      >
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6" style={{ color: BRAND }}>
          Pitch Details
        </h2>

        {/* Clock Icon */}
        <div className="flex items-center justify-center rounded-full border-[3px] w-16 h-16 mb-4" style={{ borderColor: BRAND, color: BRAND }}>
          <FiClock size={32} strokeWidth={2.5} />
        </div>

        {/* Supervisor Name */}
        <h3 className="text-xl font-medium mb-8" style={{ color: BRAND }}>
          Supervisor : {data.supervisorName}
        </h3>

        {/* Pitch Content */}
        <div className="w-full flex flex-col gap-3 mb-10 text-left">
          <p className="text-[15px]">
            <span className="font-semibold" style={{ color: BRAND }}>Project Title: </span>
            <span className="text-gray-500 font-medium">{data.projectTitle}</span>
          </p>
          
          <p className="text-[15px] leading-relaxed">
            <span className="font-semibold" style={{ color: BRAND }}>Project Pitch : </span>
            <span className="text-gray-500 font-medium">{data.projectPitch}</span>
          </p>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={onWithdrawClick}
          className="px-10 py-3 rounded-xl font-bold text-[15px] text-white bg-red-600 shadow-md hover:bg-red-700 transition-colors"
        >
          Withdraw Pitch
        </button>
      </div>

    </div>
  );
};

export default PendingPitchDetails;