import React from "react";
import { FiX } from "react-icons/fi";

const BRAND = "#302AE2";

const WithdrawModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border flex flex-col items-center w-full max-w-[500px] p-6 relative shadow-2xl"
        style={{ borderColor: BRAND }}
      >
        {/* Close X icon */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={24} strokeWidth={3} style={{ color: BRAND }} />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-4 mt-2" style={{ color: BRAND }}>
          Withdraw Pitch
        </h3>

        {/* Message */}
        <p className="text-[15px] font-medium text-gray-500 text-center mb-8 px-2">
          Are you sure you want to withdraw this pitch? This action cannot be undone.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full justify-center px-4">
          <button
            onClick={onClose}
            className="w-[160px] py-2.5 rounded-xl font-bold text-sm bg-white shadow-sm transition-colors hover:bg-gray-50"
            style={{ color: BRAND, border: `1px solid ${BRAND}` }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-[160px] py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 shadow-md hover:bg-red-700 transition-colors"
          >
            Yes, Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;