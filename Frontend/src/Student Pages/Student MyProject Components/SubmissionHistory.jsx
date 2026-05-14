import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPaperclip } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="28" r="25" stroke="#475569" strokeWidth="2.5" />
    <path d="M17 28l8 9 14-16" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SubmissionCard = ({ milestone, submittedAt, files }) => {
  const [isDownloading, setIsDownloading] = useState(false);

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
      const response = await fetch(`http://127.0.0.1:5000/api/students/download/${filename}`, {
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
    <div className="w-full bg-white rounded-2xl border border-blue-600 px-5 py-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0"><CheckCircleIcon /></div>
          <div className="min-w-0">
            <p className="font-bold text-sm sm:text-base break-words" style={{ color: BRAND }}>{milestone}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Submitted: {submittedAt}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-start sm:min-w-[220px]">
          <div className="flex flex-col gap-1">
            {files.map((file) => (
              <div key={file} className="flex items-center gap-2 text-sm text-gray-600">
                <FiPaperclip size={13} className="text-gray-400 flex-shrink-0" />
                <span className="break-all">{file}</span>
              </div>
            ))}
          </div>
          {/* --- UPDATED BUTTON --- */}
          <button
            className="w-full sm:w-auto px-6 py-2 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity mt-1 disabled:opacity-50 disabled:cursor-wait"
            style={{ backgroundColor: BRAND }}
            onClick={() => handleDownload(files[0])}
            disabled={isDownloading || !files || files.length === 0}
          >
             {isDownloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmissionHistory = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/students/submissions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSubmissions(data.data || []);
        } else {
          toast.error("Failed to load submissions.");
        }
      } catch (error) {
        toast.error("Network error.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="w-full flex flex-col px-4 pt-6 pb-12">
      <div className="mb-6">
        <button
          onClick={() => navigate("/student/myproject")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} /> Back to Project Workspace
        </button>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND }}>
        Submission History
      </h2>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
        {isLoading ? (
          <p className="text-center text-gray-500 font-medium animate-pulse mt-12">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No submissions yet.</p>
        ) : (
          submissions.map((s) => <SubmissionCard key={s.id} {...s} />)
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;