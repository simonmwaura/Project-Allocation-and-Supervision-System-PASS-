import { useState, useEffect, useRef } from "react";
import { FiFilePlus, FiChevronDown, FiArrowLeft, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const UploadDocuments = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [milestones, setMilestones] = useState([]);          // <-- fetched from API
  const [selectedMilestone, setSelectedMilestone] = useState(null); // {milestone_id, milestone_name}
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMilestonesLoading, setIsMilestonesLoading] = useState(true);

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Fetch milestones on mount
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/students/milestones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMilestones(data.data || []);
        } else {
          toast.error("Could not load milestones.");
        }
      } catch {
        toast.error("Network error loading milestones.");
      } finally {
        setIsMilestonesLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only .PDF or .DOCX files are allowed.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!selectedMilestone) return setError("Please select a milestone.");
    if (!selectedFile) return setError("Please upload a file.");

    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("milestone_id", selectedMilestone.milestone_id); // send ID, not name
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:5000/api/students/upload-document", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Document submitted successfully!");
        navigate("/student/submission-history");
      } else {
        toast.error(data.message || "Failed to upload document.");
      }
    } catch {
      toast.error("Network error. Could not upload file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col px-4 pt-6 pb-12 relative z-0">
      <div className="mb-6 relative z-10">
        <button
          onClick={() => navigate("/student/myproject")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} /> Back to Project Workspace
        </button>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND }}>
        Submit Project Documents
      </h2>

      <div
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl border-2 p-8 shadow-sm relative z-10"
        style={{ borderColor: BRAND }}
      >
        <h3 className="text-xl font-bold text-center mb-6" style={{ color: BRAND }}>
          Upload Document
        </h3>

        {/* Milestone Dropdown */}
        <div className="mb-5 relative">
          <label className="text-sm font-medium text-gray-600 mb-1 block">Select Milestone</label>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isMilestonesLoading}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 text-sm hover:border-blue-400 transition-colors disabled:opacity-60"
          >
            <div className="flex items-center gap-2">
              <FiFilePlus size={18} style={{ color: BRAND }} />
              <span>{isMilestonesLoading ? "Loading milestones..." : (selectedMilestone?.milestone_name || "Choose a milestone")}</span>
            </div>
            <FiChevronDown
              size={18}
              className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              style={{ color: BRAND }}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {milestones.map((m) => (
                <button
                  key={m.milestone_id}
                  onClick={() => {
                    setSelectedMilestone(m);
                    setDropdownOpen(false);
                    setError("");
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-blue-700 transition-colors"
                >
                  <span className="font-medium">{m.milestone_name}</span>
                  <span className="text-xs text-gray-400 ml-2">Due: {m.due_date}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-12 px-4 cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
          }`}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: BRAND }}
              >
                <FiFilePlus size={16} /> {selectedFile.name}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mt-1"
              >
                <FiX size={12} /> Remove
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3" style={{ color: "#94a3b8" }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M36 8H16a4 4 0 0 0-4 4v40a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V24L36 8z" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M36 8v16h16" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M32 36v-8M28 32l4-4 4 4" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Drag and drop your <span className="font-semibold">.PDF</span> or{" "}
                <span className="font-semibold">.DOCX</span> file here, or click to browse.
              </p>
            </>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 w-[70%] rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? "Uploading..." : "Submit Documents"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;