import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";

const BRAND = "#2b20d6";

const SuspendAccountModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  studentName = "this student" 
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(""); // Reset the text area after confirming
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl border flex flex-col w-full max-w-[550px] p-6 md:p-8 relative shadow-2xl"
        style={{ borderColor: "#ef4444" }} // Red border for danger zone
      >
        {/* Close X icon */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiX size={24} strokeWidth={2.5} />
        </button>

        {/* Header with Warning Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-600">
            <FiAlertCircle size={32} strokeWidth={2} />
          </div>
          <h3 className="text-[22px] font-extrabold text-gray-900 text-center">
            Suspend Account
          </h3>
        </div>

        {/* Message */}
        <p className="text-[15px] font-medium text-gray-600 mb-6 text-center leading-relaxed px-2">
          You are about to suspend the account for <span className="font-bold text-gray-900">{studentName}</span>. 
          Please provide a reason for this suspension. This will be logged in the system.
        </p>

        {/* Text Area Input */}
        <div className="w-full flex flex-col mb-8">
          <label className="text-sm font-bold text-gray-700 mb-2">
            Reason for Suspension <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Violation of academic integrity policy..."
            rows={4}
            className="w-full border-[1.5px] border-gray-300 rounded-xl p-3.5 text-[15px] text-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none bg-gray-50"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-[15px] text-gray-700 bg-white border-[1.5px] border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={reason.trim() === ""} // Disables button until they type a reason
            className="flex-1 py-3 rounded-xl font-bold text-[15px] text-white shadow-md bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Suspension
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendAccountModal;