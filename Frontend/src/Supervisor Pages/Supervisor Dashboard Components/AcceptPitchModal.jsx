import { FiX } from "react-icons/fi";

const BRAND = "#2b20d6";
const GREEN = "#16a34a";

const AcceptPitchModal = ({
  isOpen,
  onClose,
  onConfirm,
  studentName = "this student",
  totalSlots = 0,
  year = "4th",
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border flex flex-col items-center w-full max-w-[500px] p-6 md:p-8 relative shadow-2xl"
        style={{ borderColor: BRAND }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-70 transition-opacity" style={{ color: BRAND }}>
          <FiX size={24} strokeWidth={3} />
        </button>

        <h3 className="text-[22px] font-extrabold mb-3 mt-2" style={{ color: BRAND }}>
          Accept Pitch
        </h3>

        <p className="text-[15px] font-semibold text-gray-500 text-center mb-8 px-2 leading-relaxed">
          Are you sure you want to accept <span className="text-gray-800">{studentName}</span>?
          This will use 1 of your {totalSlots} available slots for {year}-year students.
        </p>

        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={onClose}
            className="w-[160px] py-2.5 rounded-xl font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-colors"
            style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-[160px] py-2.5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {isSubmitting ? "Accepting..." : "Confirm Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptPitchModal;