import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2"; // Locked to your exact theme

const CreatePanelModal = ({ onClose, onCreated }) => {
  const [numPanels, setNumPanels] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    if (!numPanels) {
      toast.error("Please select the number of panels.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // FIXED BUG: Updated /coordinator/ to /coordinators/ to match your Flask backend
      const response = await fetch("http://127.0.0.1:5000/api/coordinators/generate-panels", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: parseInt(numPanels) }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${numPanels} ${parseInt(numPanels) === 1 ? 'panel' : 'panels'} generated successfully!`);
        onCreated(); // Refresh the parent list
      } else {
        toast.error(data.message || "Failed to generate panels.");
      }
    } catch (error) {
      toast.error("Network error. Could not connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-[2rem] p-8 w-full max-w-lg relative shadow-2xl border-2"
        style={{ borderColor: BRAND }}
      >
        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 hover:rotate-90 transition-transform duration-200"
          style={{ color: BRAND }}
        >
          <FiX size={28} />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center mb-8" style={{ color: BRAND }}>
          Setup the Panels
        </h2>

        {/* Form Field */}
        <div className="flex flex-col gap-2 mb-10">
          <label className="text-sm font-semibold text-gray-500 ml-2">
            Number of Panels
          </label>
          <div className="relative">
            <select
              value={numPanels}
              onChange={(e) => setNumPanels(e.target.value)}
              className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-200 text-gray-600 appearance-none outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} // slate-200
            >
              <option value="" disabled>Select the number of panels to generate</option>
              {/* Added 6 to the array so they can generate all at once */}
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Panel' : 'Panels'}</option>
              ))}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePanelModal;