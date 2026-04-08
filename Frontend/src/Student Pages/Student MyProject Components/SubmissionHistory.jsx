import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPaperclip } from "react-icons/fi";

const BRAND = "#302AE2";

// Replace with real API data
const submissions = [
  {
    id: 1,
    milestone: "Milestone 1: Project Proposal & Slides",
    submittedAt: "Mar 11, 2026 at 10:15 AM",
    files: ["SmartHighway_Proposal.pdf", "SmartHighway_ProposalSlides.pdf"],
  },
  {
    id: 2,
    milestone: "Milestone 2: Project Progress",
    submittedAt: "Mar 11, 2026 at 10:15 AM",
    files: ["SmartHighway_Proposal.pdf", "SmartHighway_ProposalSlides.pdf"],
  },
  {
    id: 3,
    milestone: "Milestone 3: Final Report",
    submittedAt: "Mar 11, 2026 at 10:15 AM",
    files: ["SmartHighway_Proposal.pdf", "SmartHighway_ProposalSlides.pdf"],
  },
];

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="28" r="25" stroke="#475569" strokeWidth="2.5" />
    <path
      d="M17 28l8 9 14-16"
      stroke="#475569"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SubmissionCard = ({ milestone, submittedAt, files }) => (
  <div className="w-full bg-white rounded-2xl border border-blue-600 px-5 py-5 shadow-sm">

    {/* Top row: icon + milestone info + files (all inline on md+) */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

      {/* Left: icon + text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <CheckCircleIcon />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm sm:text-base break-words" style={{ color: BRAND }}>
            {milestone}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Submitted: {submittedAt}
          </p>
        </div>
      </div>

      {/* Right: files + download */}
      <div className="flex flex-col gap-2 sm:items-start sm:min-w-[220px]">
        <div className="flex flex-col gap-1">
          {files.map((file) => (
            <div key={file} className="flex items-center gap-2 text-sm text-gray-600">
              <FiPaperclip size={13} className="text-gray-400 flex-shrink-0" />
              <span className="break-all">{file}</span>
            </div>
          ))}
        </div>
        <button
          className="w-full sm:w-auto px-6 py-2 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity mt-1"
          style={{ backgroundColor: BRAND }}
          onClick={() => console.log("Download:", files)}
        >
          Download
        </button>
      </div>

    </div>
  </div>
);

const SubmissionHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col px-4 pt-6 pb-12 border-blue-600">

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/student/myproject")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} />
          Back to Project Workspace
        </button>
      </div>

      {/* Page Title */}
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND }}>
        Submission History
      </h2>

      {/* Cards */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
        {submissions.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No submissions yet.</p>
        ) : (
          submissions.map((s) => (
            <SubmissionCard key={s.id} {...s} />
          ))
        )}
      </div>

    </div>
  );
};

export default SubmissionHistory;