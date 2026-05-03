import { useState, useRef } from "react";
import { FiArrowLeft, FiTag, FiEdit, FiFilePlus, FiX } from "react-icons/fi";

const BRAND = "#302AE2";

const AvatarIcon = () => (
  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 bg-gray-500">
    <svg viewBox="0 0 24 24" fill="white" className="w-16 h-16 mt-2">
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
    </svg>
  </div>
);

const ProjectPitch = ({ supervisor, onBack, onSubmit, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectPitch, setProjectPitch] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const ALLOWED = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateAndSet = (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Only .PDF or .DOCX files are allowed.");
      return;
    }
    setError("");
    setAttachedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!projectTitle.trim() && !attachedFile) {
      setError("Please enter a project title or attach a full pitch document.");
      return;
    }
    setError("");
    if (onSubmit) onSubmit({ supervisor, projectTitle, projectPitch, attachedFile });
  };

  const sv = {
    ...supervisor,
    name: supervisor?.name || "Mark Antony",
    email: supervisor?.email || "mark.antony@uonbi.ac.ke",
    interests: supervisor?.interests || ["Web Development", "Artificial Intelligence", "Cybersecurity"],
    slotsTotal: supervisor?.slotsTotal || 7,
    slotsFilled: supervisor?.slotsFilled || 3,
    bio:
      supervisor?.bio ||
      "I am interested in supervising projects that bridge the gap between intelligent algorithms and secure, practical web applications. I particularly welcome proposals focused on integrating machine learning models, building secure system architectures, or developing AI-driven web platforms.",
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-16 lg:pt-8 pb-12">

      {/* Header: Back button + Title */}
      <div className="w-full max-w-5xl flex flex-col gap-4 mb-8">
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BRAND }}
          >
            <FiArrowLeft size={18} strokeWidth={3} />
            Back to Selection
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center w-full" style={{ color: BRAND }}>
          Pitch to {sv.name}
        </h2>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-5xl mx-auto">

        {/* LEFT — Supervisor Profile Card */}
        <div
          className="bg-white rounded-2xl border-2 p-5 md:p-6 flex flex-col items-center w-full lg:w-[360px] flex-shrink-0 shadow-sm h-fit"
          style={{ borderColor: BRAND }}
        >
          <AvatarIcon />

          <h3 className="font-extrabold text-2xl md:text-3xl text-gray-600 text-center mb-1">{sv.name}</h3>
          <p className="text-sm md:text-base text-gray-500 mb-6 text-center">{sv.email}</p>

          <div className="grid grid-cols-2 gap-2 mb-4 w-full">
            {sv.interests.map((tag) => (
              <span
                key={tag}
                className="text-[12px] md:text-[13px] font-semibold px-2 py-1.5 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600 text-center truncate"
                title={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="w-full border-t border-dashed border-gray-400 my-4" />

          <p className="text-[14px] md:text-[15px] text-gray-500 leading-relaxed text-left w-full">
            {sv.bio}
          </p>

          <p className="text-[15px] md:text-base font-bold text-gray-500 mt-6 self-start">
            Availability: {sv.slotsFilled}/{sv.slotsTotal} Slots Filled
          </p>
        </div>

        {/* RIGHT — Pitch Form */}
        <div
          className="flex-1 w-full bg-white rounded-2xl border-2 p-5 md:p-8 flex flex-col gap-6 shadow-sm"
          style={{ borderColor: BRAND }}
        >
          <h3 className="text-lg md:text-xl font-bold text-center mb-2" style={{ color: BRAND }}>
            Propose a Custom Project
          </h3>

          {/* Project Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-500">Your Project Title</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
              <FiTag size={18} className="text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your project title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="flex-1 text-sm md:text-base text-gray-700 bg-transparent outline-none min-w-0"
              />
            </div>
          </div>

          {/* Project Pitch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-500">Your Project Pitch</label>
            <div className="flex gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
              <FiEdit size={18} className="text-gray-500 flex-shrink-0 mt-1" />
              <textarea
                placeholder="Enter your project pitch"
                value={projectPitch}
                onChange={(e) => setProjectPitch(e.target.value)}
                rows={5}
                className="flex-1 text-sm md:text-base text-gray-700 bg-transparent outline-none resize-none min-w-0"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-sm text-gray-500">Attach full Project Pitch</label>
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 md:py-10 px-4 cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-400 bg-gray-50"
              }`}
            >
              {attachedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white break-all text-center"
                    style={{ backgroundColor: BRAND }}
                  >
                    <FiFilePlus size={16} className="flex-shrink-0" />
                    {attachedFile.name}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                    className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 mt-2 font-bold"
                  >
                    <FiX size={14} /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <p className="text-xs md:text-sm text-gray-400 text-center font-medium">
                    Drag and drop your full proposal (.PDF, .DOCX) here.
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files[0])}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          {/* Action Buttons */}
          <div className="flex gap-3 md:gap-4 mt-2">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl font-bold text-sm md:text-base bg-[#d1d5db] text-white shadow-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-sm md:text-base text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              {isSubmitting ? "Submitting..." : "Submit Pitch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPitch;