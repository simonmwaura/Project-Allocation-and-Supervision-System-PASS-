import { useState } from "react";
import { FiX } from "react-icons/fi";

const BRAND = "#2b20d6";

const DeclinePitchModal = ({
  isOpen,
  onClose,
  onConfirm,
  studentName = "this student",
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl border flex flex-col w-full max-w-[550px] p-6 md:p-8 relative shadow-2xl"
        style={{ borderColor: BRAND }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 hover:opacity-70 transition-opacity" style={{ color: BRAND }}>
          <FiX size={24} strokeWidth={3} />
        </button>

        <h3 className="text-[22px] font-extrabold mb-4 mt-2 text-center" style={{ color: BRAND }}>
          Decline Pitch
        </h3>

        <p className="text-[15px] font-semibold text-gray-500 mb-4 leading-relaxed">
          Are you sure you want to decline this project pitch from{" "}
          <span className="text-gray-800">{studentName}</span>?
          Please provide a reason for the student.
        </p>

        <div className="w-full flex flex-col mb-8">
          <label className="text-sm font-medium text-gray-500 mb-1">Reason for declining</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The project topic falls outside my research area..."
            rows={4}
            className="w-full border border-gray-400 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={handleClose}
            className="w-[160px] py-2.5 rounded-xl font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-colors"
            style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={reason.trim() === "" || isSubmitting}
            className="w-[160px] py-2.5 rounded-xl font-bold text-[15px] text-white shadow-md bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Declining..." : "Confirm Decline"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeclinePitchModal;