import React from "react";
import { FiArrowLeft, FiInfo } from "react-icons/fi";

const BRAND = "#302AE2";

const DeclinedPitchDetails = ({ pitchData, onBack, onPitchAgain }) => {
  return (
    <div className="w-full flex flex-col items-center pt-2 pb-12 relative z-0">
      
      {/* Top Bar with Back Button */}
      <div className="w-full max-w-5xl flex justify-start mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} strokeWidth={3} />
          Back to Supervisor Selection
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Pitch Details */}
        <div className="bg-white rounded-2xl border flex flex-col items-center p-8 shadow-sm" style={{ borderColor: BRAND }}>
          <h2 className="text-3xl font-bold text-red-600 mb-6">Pitch Declined</h2>
          <div className="flex items-center justify-center rounded-full border-[3px] border-red-600 text-red-600 w-16 h-16 mb-6">
            <FiInfo size={32} strokeWidth={3} />
          </div>
          <h3 className="text-lg font-bold mb-6" style={{ color: BRAND }}>Supervisor : {pitchData.supervisorName}</h3>
          
          <div className="w-full flex flex-col gap-3 text-left">
            <p className="text-[14px]">
              <span className="font-bold" style={{ color: BRAND }}>Project Title: </span>
              <span className="text-gray-500 font-medium">{pitchData.projectTitle}</span>
            </p>
            <p className="text-[14px] leading-relaxed">
              <span className="font-bold" style={{ color: BRAND }}>Project Pitch : </span>
              <span className="text-gray-500 font-medium">{pitchData.projectPitch}</span>
            </p>
          </div>
        </div>

        {/* Right Card: Decline Reason */}
        <div className="bg-white rounded-2xl border flex flex-col items-center p-8 shadow-sm h-full" style={{ borderColor: BRAND }}>
          <h3 className="text-[17px] font-medium text-gray-500 mb-6">Reason why the pitch was declined</h3>
          
          <div className="w-full flex-1 bg-gray-50 border border-gray-300 rounded-xl p-5 mb-8 text-[14px] text-gray-600 font-medium leading-relaxed overflow-y-auto">
            {pitchData.declineReason || "No specific reason provided by the supervisor."}
          </div>

          <button
            onClick={onPitchAgain}
            className="w-full max-w-[200px] py-3.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-colors"
            style={{ backgroundColor: BRAND }}
          >
            Pitch Again
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeclinedPitchDetails;