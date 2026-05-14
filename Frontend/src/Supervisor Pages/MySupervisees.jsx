import { useState, useEffect } from "react";
import { FiUser, FiMail, FiHash, FiFileText, FiChevronDown, FiChevronUp, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

// ─── Empty state for a year group ────────────────────────────────────────────
const EmptyYear = ({ year }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed" style={{ borderColor: BRAND }}>
    <FiUser size={40} className="mb-3 opacity-30" style={{ color: BRAND }} />
    <p className="text-gray-400 font-medium text-sm">No {year}-year students assigned yet.</p>
  </div>
);

// ─── Submission pill ──────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const styles = {
    "On Time":     { bg: "#dcfce7", color: "#16a34a" },
    "Late":        { bg: "#fee2e2", color: "#dc2626" },
    "Resubmitted": { bg: "#fef3c7", color: "#b45309" },
  };
  const s = styles[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ─── Student card with expandable submissions ─────────────────────────────────
const StudentCard = ({ student }) => {
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Added loading state for downloads
  const hasSubmissions = student.submissions.length > 0;

  // --- NEW DOWNLOAD FUNCTION ---
  const handleDownload = async (filename) => {
    if (!filename) {
      toast.error("No file attached to this submission.");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading(`Downloading ${filename}...`);

    try {
      const token = localStorage.getItem("token");
      
      // Fetch the file securely with the JWT token
      const response = await fetch(`http://127.0.0.1:5000/api/supervisors/download/${filename}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("File not found or access denied.");
      }

      // Convert the response into a raw file blob
      const blob = await response.blob();
      
      // Create a temporary invisible link in the browser to force download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename; 
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.update(toastId, { render: "Download complete!", type: "success", isLoading: false, autoClose: 3000 });

    } catch (error) {
      console.error(error);
      toast.update(toastId, { render: "Failed to download file.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm" style={{ borderColor: BRAND }}>

      {/* Header row */}
      <button
        onClick={() => hasSubmissions && setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${hasSubmissions ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{ backgroundColor: BRAND }}
          >
            {student.studentName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 truncate">{student.studentName}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <FiHash size={10} /> {student.registrationNumber}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <FiMail size={10} /> {student.email}
              </span>
            </div>
            <p className="text-sm font-semibold mt-1 truncate" style={{ color: BRAND }}>
              {student.projectTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full hidden sm:block"
            style={{
              backgroundColor: hasSubmissions ? "#dcfce7" : "#f3f4f6",
              color: hasSubmissions ? "#16a34a" : "#9ca3af",
            }}
          >
            {student.submissions.length} submission{student.submissions.length !== 1 ? "s" : ""}
          </span>
          {hasSubmissions && (
            open
              ? <FiChevronUp size={18} className="text-gray-400" />
              : <FiChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Submissions list */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60 flex flex-col gap-3">
          {student.submissions.map((sub) => (
            <div
              key={sub.submissionId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-700 truncate">{sub.milestone}</p>
                  <StatusPill status={sub.submissionStatus} />
                </div>
                <p className="text-xs text-gray-400">Submitted: {sub.submittedAt}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sub.files.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                      <FiFileText size={10} /> {f}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* --- UPDATED DOWNLOAD BUTTON --- */}
              <button
                onClick={() => handleDownload(sub.files[0])}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-wait"
                style={{ backgroundColor: BRAND }}
              >
                <FiDownload size={14} /> 
                {isDownloading ? "Downloading..." : "Download"}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Year section ─────────────────────────────────────────────────────────────
const YearSection = ({ year, students }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <h3 className="text-xl font-extrabold shrink-0" style={{ color: BRAND }}>
        {year === "2" ? "2nd" : "4th"} Year Students
      </h3>
      <div className="flex-1 h-px bg-gray-200" />
      <span
        className="text-sm font-bold px-3 py-1 rounded-full shrink-0"
        style={{ backgroundColor: "#eef0ff", color: BRAND }}
      >
        {students.length} student{students.length !== 1 ? "s" : ""}
      </span>
    </div>

    {students.length === 0
      ? <EmptyYear year={year === "2" ? "2nd" : "4th"} />
      : students.map((s) => <StudentCard key={s.studentId} student={s} />)
    }
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const MySupervisees = () => {
  const [year2, setYear2] = useState([]);
  const [year4, setYear4] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/supervisors/my-supervisees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setYear2(data.data.year2 || []);
          setYear4(data.data.year4 || []);
        } else {
          toast.error(data.message || "Could not load supervisees.");
        }
      } catch {
        toast.error("Network error.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisees();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-20">
        <div className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>
          Loading your supervisees...
        </div>
      </div>
    );
  }

  const total = year2.length + year4.length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col px-4 pt-6 pb-16 gap-10">

      <div className="text-center">
        <h2 className="text-3xl font-bold" style={{ color: BRAND }}>My Supervisees</h2>
        {total > 0 && (
          <p className="text-gray-400 text-sm mt-1 font-medium">
            {total} student{total !== 1 ? "s" : ""} total
          </p>
        )}
      </div>

      <YearSection year="4" students={year4} />
      <YearSection year="2" students={year2} />

    </div>
  );
};

export default MySupervisees;