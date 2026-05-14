import { useState, useEffect } from "react";
import { FiUsers, FiFileText, FiDownload, FiChevronDown, FiChevronUp, FiShield, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

// ─── No Panel State ───────────────────────────────────────────────────────────
const NoPanelAssigned = () => (
  <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-24 px-8 text-center">
    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#eef0ff" }}>
      <FiUsers size={44} style={{ color: BRAND }} />
    </div>
    <h3 className="text-2xl font-bold mb-3" style={{ color: BRAND }}>
      No Panel Assigned
    </h3>
    <p className="text-gray-500 font-medium leading-relaxed">
      You have not been assigned to a panel yet. The coordinator will add you to a panel once the allocation process begins.
    </p>
  </div>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span
    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
    style={{
      backgroundColor: role === "Chair" ? "#fef3c7" : "#eef0ff",
      color: role === "Chair" ? "#b45309" : BRAND,
    }}
  >
    {role === "Chair" ? <FiShield size={11} /> : <FiUser size={11} />}
    {role}
  </span>
);

// ─── Submission Row ───────────────────────────────────────────────────────────
const SubmissionRow = ({ submission }) => {
  const handleDownload = () => {
    toast.info(`Downloading ${submission.files[0] ?? "file"}...`);
    // In production: hit a secure download endpoint that streams the file
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{submission.milestone}</p>
        <p className="text-xs text-gray-400">Submitted: {submission.submittedAt}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {submission.files.map((f) => (
            <span key={f} className="flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-0.5">
              <FiFileText size={10} /> {f}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0 hover:opacity-90 transition-opacity shadow-sm"
        style={{ backgroundColor: BRAND }}
      >
        <FiDownload size={14} /> Download
      </button>
    </div>
  );
};

// ─── Student Accordion Card ───────────────────────────────────────────────────
const StudentCard = ({ student }) => {
  const [open, setOpen] = useState(false);
  const hasSubmissions = student.submissions.length > 0;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => hasSubmissions && setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${hasSubmissions ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-bold text-gray-800 truncate">{student.studentName}</p>
          <p className="text-xs text-gray-400">{student.registrationNumber} · Year {student.year}</p>
          <p className="text-sm font-semibold truncate" style={{ color: BRAND }}>{student.projectTitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: hasSubmissions ? "#dcfce7" : "#f3f4f6",
              color: hasSubmissions ? "#16a34a" : "#9ca3af",
            }}
          >
            {student.submissions.length} submission{student.submissions.length !== 1 ? "s" : ""}
          </span>
          {hasSubmissions && (
            open ? <FiChevronUp size={18} className="text-gray-400" /> : <FiChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
          {student.submissions.map((sub) => (
            <SubmissionRow key={sub.submissionId} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Supervisor Section ───────────────────────────────────────────────────────
const SupervisorSection = ({ member, isCurrentUser }) => {
  const [open, setOpen] = useState(isCurrentUser); // auto-open your own section

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: isCurrentUser ? BRAND : "#e5e7eb" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
            style={{ backgroundColor: isCurrentUser ? BRAND : "#9ca3af" }}
          >
            {member.supervisorName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-800">{member.supervisorName}</p>
              {isCurrentUser && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: BRAND }}>
                  You
                </span>
              )}
              <RoleBadge role={member.role} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{member.supervisorEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-sm font-semibold text-gray-500">{member.students.length} student{member.students.length !== 1 ? "s" : ""}</span>
          {open ? <FiChevronUp size={18} className="text-gray-400" /> : <FiChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {/* Students list */}
      {open && (
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-gray-50/50">
          {member.students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No students assigned to this supervisor yet.</p>
          ) : (
            member.students.map((student) => (
              <StudentCard key={student.studentId} student={student} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyPanel = () => {
  const [panelData, setPanelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchPanel = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/supervisors/my-panel", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setPanelData(data.data);
          setCurrentUserId(data.data?.currentSupervisorId);
        } else if (response.status === 404) {
          setPanelData(null); // not on a panel yet
        } else {
          toast.error(data.message || "Could not load panel data.");
        }
      } catch {
        toast.error("Network error.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPanel();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-20">
        <div className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>
          Loading your panel...
        </div>
      </div>
    );
  }

  if (!panelData) return <NoPanelAssigned />;

  return (
    <div className="w-full flex flex-col px-4 pt-6 pb-16 max-w-5xl mx-auto">

      {/* Page Title */}
      <h2 className="text-3xl font-bold text-center mb-2" style={{ color: BRAND }}>
        My Panel
      </h2>

      {/* Panel Info Bar */}
      <div
        className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 rounded-2xl text-white mb-8 mt-4 shadow-sm"
        style={{ backgroundColor: BRAND }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Panel</p>
          <p className="text-lg font-extrabold">{panelData.panelNumber}</p>
        </div>
        <div className="w-px h-8 bg-white/30" />
        <div className="text-center">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Year Group</p>
          <p className="text-lg font-extrabold">{panelData.year === "2" ? "2nd Year" : "4th Year"}</p>
        </div>
        <div className="w-px h-8 bg-white/30" />
        <div className="text-center">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Your Role</p>
          <p className="text-lg font-extrabold">{panelData.myRole}</p>
        </div>
        <div className="w-px h-8 bg-white/30" />
        <div className="text-center">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Members</p>
          <p className="text-lg font-extrabold">{panelData.members.length}</p>
        </div>
      </div>

      {/* One section per panelist */}
      <div className="flex flex-col gap-5">
        {panelData.members.map((member) => (
          <SupervisorSection
            key={member.supervisorId}
            member={member}
            isCurrentUser={member.supervisorId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default MyPanel;