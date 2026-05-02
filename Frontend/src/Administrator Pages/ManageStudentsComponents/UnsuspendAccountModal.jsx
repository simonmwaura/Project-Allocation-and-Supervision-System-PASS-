import React from "react";
import { FiX, FiRefreshCcw } from "react-icons/fi";

const UnsuspendAccountModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName,
  reason 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl border flex flex-col w-full max-w-[550px] p-6 md:p-8 relative shadow-2xl"
        style={{ borderColor: "#16a34a" }} // Green border for restoration
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
          <FiX size={24} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
            <FiRefreshCcw size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-[22px] font-extrabold text-gray-900 text-center">
            Restore Account
          </h3>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-bold text-red-800 mb-1">Current Suspension Reason:</p>
          <p className="text-sm text-red-600 font-medium italic">
            "{reason || "No specific reason provided."}"
          </p>
        </div>

        <p className="text-[15px] font-medium text-gray-600 mb-8 text-center leading-relaxed px-2">
          You are about to restore access for <span className="font-bold text-gray-900">{userName}</span>. 
          They will immediately regain the ability to log into the system.
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-[15px] text-gray-700 bg-white border-[1.5px] border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-[15px] text-white shadow-md bg-green-600 hover:bg-green-700 transition-colors"
          >
            Restore Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsuspendAccountModal;