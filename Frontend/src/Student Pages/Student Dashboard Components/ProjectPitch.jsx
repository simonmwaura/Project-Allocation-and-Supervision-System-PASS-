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

// Shows one year group's capacity as a coloured pill
const SlotPill = ({ label, filled, total }) => {
  const full = filled >= total;
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold"
      style={{
        backgroundColor: full ? "#fee2e2" : "#dcfce7",
        color:           full ? "#dc2626" : "#16a34a",
      }}
    >
      <span>{label}</span>
      <span>{filled}/{total} {full ? "— Full" : "— Available"}</span>
    </div>
  );
};

const ProjectPitch = ({ supervisor, onBack, onSubmit, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectPitch, setProjectPitch] = useState("");
  const [attachedFile, setAttachedFile]  = useState(null);
  const [dragOver, setDragOver]          = useState(false);
  const [error, setError]                = useState("");

  const ALLOWED = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateAndSet = (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { setError("Only .PDF or .DOCX files are allowed."); return; }
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
    name:             supervisor?.name             || "Unknown Supervisor",
    email:            supervisor?.email            || "Email not provided",
    interests:        supervisor?.interests        || [],
    bio:              supervisor?.bio              || "No biography available.",
    office_location:  supervisor?.office_location  || "",
    office_hours:     supervisor?.office_hours     || "",
    slots_2nd_filled: supervisor?.slots_2nd_filled ?? 0,
    slots_2nd_total:  supervisor?.slots_2nd_total  ?? 0,
    slots_4th_filled: supervisor?.slots_4th_filled ?? 0,
    slots_4th_total:  supervisor?.slots_4th_total  ?? 0,
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-16 lg:pt-8 pb-12">

      {/* Header */}
      <div className="w-full max-w-5xl flex flex-col gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity w-fit"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} strokeWidth={3} /> Back to Selection
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-center" style={{ color: BRAND }}>
          Pitch to {sv.name}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-5xl mx-auto">

        {/* LEFT — Supervisor card */}
        <div
          className="bg-white rounded-2xl border-2 p-5 md:p-6 flex flex-col items-center w-full lg:w-[360px] flex-shrink-0 shadow-sm"
          style={{ borderColor: BRAND }}
        >
          <AvatarIcon />
          <h3 className="font-extrabold text-2xl text-gray-600 text-center mb-1">{sv.name}</h3>
          <p className="text-sm text-gray-500 mb-2 text-center">{sv.email}</p>

          {(sv.office_location || sv.office_hours) && (
            <div className="w-full mb-4 flex flex-col gap-1">
              {sv.office_location && <p className="text-xs text-gray-400 text-center">📍 {sv.office_location}</p>}
              {sv.office_hours    && <p className="text-xs text-gray-400 text-center">🕐 {sv.office_hours}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4 w-full">
            {sv.interests.length > 0 ? sv.interests.map((tag) => (
              <span key={tag} className="text-[12px] font-semibold px-2 py-1.5 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600 text-center truncate" title={tag}>
                {tag}
              </span>
            )) : (
              <span className="text-xs text-gray-400 col-span-2 text-center italic">No interests listed</span>
            )}
          </div>

          <div className="w-full border-t border-dashed border-gray-400 my-4" />

          <p className="text-[14px] text-gray-500 leading-relaxed text-left w-full mb-4">{sv.bio}</p>

          <div className="w-full border-t border-dashed border-gray-400 my-4" />

          {/* ── Year-specific availability ── */}
          <p className="text-sm font-bold text-gray-600 mb-3 self-start">Availability</p>
          <div className="w-full flex flex-col gap-2">
            <SlotPill label="2nd Year" filled={sv.slots_2nd_filled} total={sv.slots_2nd_total} />
            <SlotPill label="4th Year" filled={sv.slots_4th_filled} total={sv.slots_4th_total} />
          </div>
        </div>

        {/* RIGHT — Pitch form */}
        <div
          className="flex-1 w-full bg-white rounded-2xl border-2 p-5 md:p-8 flex flex-col gap-6 shadow-sm"
          style={{ borderColor: BRAND }}
        >
          <h3 className="text-lg md:text-xl font-bold text-center" style={{ color: BRAND }}>
            Propose a Custom Project
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-500">Your Project Title</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-blue-400 transition-all">
              <FiTag size={18} className="text-gray-500 flex-shrink-0" />
              <input type="text" placeholder="Enter your project title" value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none min-w-0" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-500">Your Project Pitch</label>
            <div className="flex gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-blue-400 transition-all">
              <FiEdit size={18} className="text-gray-500 flex-shrink-0 mt-1" />
              <textarea placeholder="Describe your project idea" value={projectPitch}
                onChange={(e) => setProjectPitch(e.target.value)}
                rows={5} className="flex-1 text-sm text-gray-700 bg-transparent outline-none resize-none min-w-0" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-sm text-gray-500">Attach full Project Pitch</label>
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 px-4 cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-400 bg-gray-50"
              }`}
            >
              {attachedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: BRAND }}>
                    <FiFilePlus size={16} /> {attachedFile.name}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                    className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 mt-2 font-bold">
                    <FiX size={14} /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <p className="text-sm text-gray-400 text-center font-medium">Drag and drop (.PDF, .DOCX) here.</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
              onChange={(e) => validateAndSet(e.target.files[0])} />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <div className="flex gap-4 mt-2">
            <button onClick={onBack} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#d1d5db] text-white shadow-md hover:bg-gray-400 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: BRAND }}>
              {isSubmitting ? "Submitting..." : "Submit Pitch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPitch;