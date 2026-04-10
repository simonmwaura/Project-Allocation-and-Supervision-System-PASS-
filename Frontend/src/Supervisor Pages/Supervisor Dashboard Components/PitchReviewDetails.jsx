import React, { useState } from "react";
import { FiArrowLeft, FiUser, FiFileText } from "react-icons/fi";
import AcceptPitchModal from "./AcceptPitchModal";   // <-- Imported Accept Modal
import DeclinePitchModal from "./DeclinePitchModal"; // <-- Imported Decline Modal

const BRAND = "#2b20d6";

const PitchReviewDetails = ({ pitch, onBack, onAccept, onDecline }) => {
  // Loading states for after confirmation
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  
  // Modal visibility states
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  // Safely merge the passed 'pitch' with default fallback text. 
  const data = {
    id: pitch?.id || 1,
    studentName: pitch?.name || pitch?.studentName || "Simon Mwaura",
    email: pitch?.email || "simonmwaura@students.uonbi.ac.ke",
    year: pitch?.year || "4th",
    phone: pitch?.phone || "+254788901455",
    regNumber: pitch?.reg || pitch?.regNumber || "SCS3/146789/2024",
    projectTitle: pitch?.project || pitch?.projectTitle || "Project Allocation and Supervision System (PASS)",
    projectPitch: pitch?.projectPitch || "The Project Allocation and Supervision System (PASS) aims to address the recurring administrative bottlenecks associated with manual project matching in computing departments. Currently, students frequently encounter difficulties finding suitable supervisors whose research interests align with their own, while lecturers are often overburdened with disorganized proposals and unbalanced supervision loads.\n\nOur proposed web-based system, PASS, automates and streamlines this matching process. It features a secure, role-based architecture that allows students to browse faculty research profiles, submit structured project pitches, and upload milestone documents. For supervisors, it provides a centralized dashboard to review abstracts, manage their assigned cohorts, and enforce departmental supervision capacity limits.",
    documentUrl: pitch?.documentUrl || "#", 
  };

  // Triggers when "Confirm Accept" is clicked inside the Accept Modal
  const handleConfirmAccept = () => {
      setIsAcceptModalOpen(false); // Close modal
      setIsAccepting(true);        // Start loading
      setTimeout(() => {
          setIsAccepting(false);
          onAccept(data.id);
      }, 1000);
  }

  // Triggers when "Confirm Decline" is clicked inside the Decline Modal
  const handleConfirmDecline = (reason) => {
      setIsDeclineModalOpen(false); // Close modal
      setIsDeclining(true);         // Start loading
      
      console.log("Declining pitch. Reason given:", reason);
      
      setTimeout(() => {
          setIsDeclining(false);
          onDecline(data.id);
      }, 1000);
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-2 md:p-4">
      
      {/* --- RENDER BOTH MODALS HERE --- */}
      <AcceptPitchModal 
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleConfirmAccept}
        studentName={data.studentName}
        year={data.year}
        totalSlots={7} // Hardcoded for now, can be passed down as a prop later
      />

      <DeclinePitchModal 
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirm={handleConfirmDecline}
        studentName={data.studentName}
      />
      {/* ------------------------------- */}

      <div 
        className="w-full max-w-6xl bg-white border rounded-3xl p-6 md:p-8"
        style={{ borderColor: BRAND }}
      >
        
        {/* Responsive Header using Flexbox */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          
          <div className="w-full lg:flex-1 flex justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: BRAND }}
            >
              <FiArrowLeft size={18} strokeWidth={3} />
              Back to Dashboard
            </button>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-center lg:flex-none" style={{ color: BRAND }}>
            Reviewing Pitch: {data.studentName}
          </h2>

          <div className="hidden lg:flex lg:flex-1"></div> {/* Spacer to keep title centered on desktop */}

        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          
          {/* LEFT COLUMN: Student Info Card */}
          <div 
            className="w-full lg:w-[320px] bg-white border rounded-2xl p-8 flex flex-col items-center flex-shrink-0"
            style={{ borderColor: BRAND }}
          >
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center text-white mb-4">
              <FiUser size={50} />
            </div>
            
            <h3 className="font-extrabold text-xl text-gray-700 mb-0.5">{data.studentName}</h3>
            <p className="text-[13px] font-medium text-gray-400 mb-6">{data.email}</p>

            {/* Dashed Divider */}
            <div className="w-full border-t-[1.5px] border-dashed border-gray-300 mb-4" />

            {/* Details */}
            <div className="w-full flex flex-col gap-1.5 text-[13px] text-gray-500 font-bold">
              <p>Year : <span className="font-medium">{data.year}</span></p>
              <p>Phone Number : <span className="font-medium">{data.phone}</span></p>
              <p>Registration Number : <span className="font-medium">{data.regNumber}</span></p>
            </div>
          </div>

          {/* RIGHT COLUMN: Project Details & Actions */}
          <div className="flex-1 w-full flex flex-col gap-4">
            
            {/* Project Details Card */}
            <div 
              className="w-full bg-[#f8fafc] lg:bg-white border rounded-2xl p-6 md:p-8 flex flex-col"
              style={{ borderColor: BRAND }}
            >
              <h3 className="text-[22px] font-extrabold mb-1" style={{ color: BRAND }}>
                Project Details
              </h3>
              <h4 className="text-[17px] font-bold text-gray-900 mb-3">
                {data.projectTitle}
              </h4>
              
              <p className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-line mb-8 font-medium">
                {data.projectPitch}
              </p>

              {/* Download Button */}
              <div className="flex justify-center mt-auto">
                <button 
                  className="flex items-center gap-2 border-[1.5px] border-gray-700 text-gray-800 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FiFileText size={18} />
                  Download Proposal Document
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                // OPENS THE DECLINE MODAL
                onClick={() => setIsDeclineModalOpen(true)}
                disabled={isAccepting || isDeclining}
                className="flex-1 py-3.5 rounded-xl font-bold text-[15px] bg-white text-red-500 border-[1.5px] border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeclining ? "Declining..." : "Decline Pitch"}
              </button>
              
              <button
                // OPENS THE ACCEPT MODAL
                onClick={() => setIsAcceptModalOpen(true)}
                disabled={isAccepting || isDeclining}
                className="flex-1 py-3.5 rounded-xl font-bold text-[15px] text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: BRAND }} 
              >
                {isAccepting ? "Accepting..." : "Accept Pitch"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PitchReviewDetails;