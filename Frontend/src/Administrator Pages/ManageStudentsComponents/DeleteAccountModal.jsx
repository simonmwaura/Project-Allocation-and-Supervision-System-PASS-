import React, { useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 10) return;
    onConfirm(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <FiX size={24} />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Account?</h2>
          <p className="text-sm text-gray-500 font-medium">
            You are about to permanently delete <strong className="text-gray-800">{userName}</strong>. This action cannot be undone and all associated data will be erased.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block">Reason for Deletion (Required, Min 10 chars)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Unauthorized test account created by mistake..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-24 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={reason.trim().length < 10}
            className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;